import { turso } from './turso';

export class StorageTieringService {
  /**
   * Archive old sessions to R2 (via ghost-bridge worker)
   * sessions older than 30 days are compressed and moved to R2,
   * removing the heavy crawl_pages data from Turso but keeping metadata.
   */
  async archiveOldSessions(projectId: string): Promise<void> {
    const client = turso();
    const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      // Find sessions older than 30 days that haven't been archived yet
      const oldSessions = await client.execute({
        sql: `SELECT id FROM crawl_sessions 
              WHERE created_at < ? 
              AND id IN (SELECT session_id FROM crawl_runs WHERE project_id = ?)`,
        args: [cutoff30d, projectId]
      });
      
      for (const session of oldSessions.rows) {
        const sessionId = String(session.id);
        
        // 1. Fetch all page data for this session
        const pages = await client.execute({
          sql: 'SELECT * FROM crawl_pages WHERE session_id = ?',
          args: [sessionId]
        });
        
        if (pages.rows.length === 0) continue;
        
        // 2. Upload to R2 via our worker
        const archiveKey = `archives/${projectId}/${sessionId}.json`;
        const response = await fetch('/api/storage/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: archiveKey,
            data: JSON.stringify(pages.rows)
          })
        });
        
        if (response.ok) {
          // 3. Delete pages from Turso to save space
          await client.execute({
            sql: 'DELETE FROM crawl_pages WHERE session_id = ?',
            args: [sessionId]
          });
          
          // 4. Update session metadata to indicate it's archived
          await client.execute({
            sql: "UPDATE crawl_sessions SET metadata = JSON_SET(COALESCE(metadata, '{}'), '$.isArchived', true) WHERE id = ?",
            args: [sessionId]
          });
          
          console.info(`Successfully archived session ${sessionId} to R2`);
        }
      }
    } catch (err) {
      console.error('Failed to archive old sessions:', err);
    }
  }

  /**
   * Retention policy enforcement
   * Keep only N most recent crawl runs in Turso.
   */
  async enforceRetentionPolicy(projectId: string, keepCount: number): Promise<void> {
    const client = turso();
    
    try {
      const result = await client.execute({
        sql: `SELECT id, session_id FROM crawl_runs 
              WHERE project_id = ? 
              ORDER BY created_at DESC LIMIT 100 OFFSET ?`,
        args: [projectId, keepCount]
      });
      
      for (const run of result.rows) {
        // Delete or archive based on policy
        // For now, we'll just archive them
        await this.archiveSession(projectId, String(run.session_id));
      }
    } catch (err) {
      console.error('Retention enforcement failed:', err);
    }
  }

  private async archiveSession(projectId: string, sessionId: string) {
    // Logic similar to archiveOldSessions for a single session
  }
}

export const storageTiering = new StorageTieringService();
