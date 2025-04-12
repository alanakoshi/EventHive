import React, { createContext, useState } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [eventOptions, setEventOptions] = useState({
        theme: [],
        venue: [],
        dates: [],  // Changed "date" to "dates"
    });

    const [votes, setVotes] = useState({
        theme: {},
        venue: {},
        dates: {},  // Changed "date" to "dates"
    });

    return (
        <EventContext.Provider value={{ eventOptions, setEventOptions, votes, setVotes }}>
            {children}
        </EventContext.Provider>
    );
};
