import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BusinessRecord } from '../services/app-types';

interface BusinessContextType {
    businesses: BusinessRecord[];
    activeBusiness: BusinessRecord | null;
    setActiveBusiness: (business: BusinessRecord | null) => void;
    setBusinesses: (businesses: BusinessRecord[]) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Basic mock initialization for now
    const [businesses, setBusinesses] = useState<BusinessRecord[]>([{
        id: 'business_1',
        workspace_id: 'workspace_1',
        name: 'My Agency'
    }]);
    const [activeBusiness, setActiveBusiness] = useState<BusinessRecord | null>(businesses[0]);

    return (
        <BusinessContext.Provider value={{ businesses, activeBusiness, setActiveBusiness, setBusinesses }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (!context) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};
