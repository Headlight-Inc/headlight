import { turso } from './turso';

export interface MCPServerConfig {
  id: string;
  project_id: string;
  name: string;
  url: string;
  auth_type: 'bearer' | 'oauth' | 'none';
  auth_token?: string;
  enabled: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export class MCPClientService {
  /**
   * List available tools from an MCP server
   */
  async listTools(config: MCPServerConfig): Promise<MCPTool[]> {
    if (!config.enabled) return [];
    
    try {
      const response = await fetch(`${config.url}/mcp/tools`, {
        headers: this.getHeaders(config)
      });
      
      if (!response.ok) throw new Error(`MCP server returned ${response.status}`);
      const data = await response.json();
      return data.tools || [];
    } catch (err) {
      console.error(`Failed to list tools for MCP server ${config.name}:`, err);
      return [];
    }
  }

  /**
   * Call a tool on an MCP server
   */
  async callTool(config: MCPServerConfig, toolName: string, args: any): Promise<any> {
    if (!config.enabled) throw new Error('MCP server is disabled');
    
    try {
      const response = await fetch(`${config.url}/mcp/call`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(config),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: toolName, arguments: args })
      });
      
      if (!response.ok) throw new Error(`MCP server returned ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`Failed to call tool ${toolName} on MCP server ${config.name}:`, err);
      throw err;
    }
  }

  /**
   * Fetch all MCP servers for a project
   */
  async getProjectServers(projectId: string): Promise<MCPServerConfig[]> {
    const client = turso();
    const result = await client.execute({
      sql: 'SELECT * FROM mcp_servers WHERE project_id = ?',
      args: [projectId]
    });
    
    return result.rows.map(row => ({
      id: String(row.id),
      project_id: String(row.project_id),
      name: String(row.name),
      url: String(row.url),
      auth_type: row.auth_type as any,
      enabled: Boolean(row.enabled)
    }));
  }

  private getHeaders(config: MCPServerConfig): Record<string, string> {
    const headers: Record<string, string> = {};
    if (config.auth_type === 'bearer' && config.auth_token) {
      headers['Authorization'] = `Bearer ${config.auth_token}`;
    }
    return headers;
  }
}

export const mcpClient = new MCPClientService();
