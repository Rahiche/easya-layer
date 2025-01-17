import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface EventMessage {
    timestamp: number;
    eventName: string;
    data: any;
}

const EventDisplay: React.FC = () => {
    const { subscribeToEvents, unsubscribeFromEvents, connectionStatus } = useBlockchain();
    const [events, setEvents] = useState<EventMessage[]>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());

    // List of available events
    const availableEvents = [
        'connected',
        'disconnected',
        'ledgerClosed',
        'validationReceived',
        'transaction',
        'peerStatusChange',
        'consensusPhase',
        'manifestReceived',
        'path_find',
        'error',
    ];

    useEffect(() => {
        // Cleanup subscriptions on unmount
        return () => {
            activeSubscriptions.forEach(eventName => {
                unsubscribeFromEvents(eventName).catch(console.error);
            });
        };
    }, [activeSubscriptions, unsubscribeFromEvents]);

    const handleSubscribe = async (eventName: string) => {
        if (activeSubscriptions.has(eventName)) return;

        try {
            await subscribeToEvents(eventName, (data: any) => {
                setEvents(prev => [{
                    timestamp: Date.now(),
                    eventName,
                    data
                }, ...prev].slice(0, 50)); // Keep last 50 events
            });
            setActiveSubscriptions(prev => new Set([...prev, eventName]));
        } catch (error) {
            console.error(`Failed to subscribe to ${eventName}:`, error);
        }
    };

    const handleUnsubscribe = async (eventName: string) => {
        try {
            await unsubscribeFromEvents(eventName);
            setActiveSubscriptions(prev => {
                const next = new Set(prev);
                next.delete(eventName);
                return next;
            });
        } catch (error) {
            console.error(`Failed to unsubscribe from ${eventName}:`, error);
        }
    };

    if (connectionStatus !== 'Connected') {
        return (
            <div className="p-4 bg-gray-100 rounded">
                <p className="text-gray-600">Please connect to the blockchain to view events.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded">
                {availableEvents.map(eventName => (
                    <button
                        key={eventName}
                        onClick={() =>
                            activeSubscriptions.has(eventName)
                                ? handleUnsubscribe(eventName)
                                : handleSubscribe(eventName)
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${activeSubscriptions.has(eventName)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {eventName}
                        {activeSubscriptions.has(eventName) ? ' ✓' : ''}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {events.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="p-4 bg-white rounded shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-green-600">
                                {event.eventName}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <pre className="mt-2 text-sm text-gray-700 overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventDisplay;