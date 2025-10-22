
import React, { createContext, useContext, useEffect, useState } from "react";

const SelectedClientContext = createContext({
  selectedClientId: null,
  selectedClientName: null,
  setSelectedClient: (_id, _name) => {},
  clearSelectedClient: () => {},
});

export function SelectedClientProvider({ children }) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientName, setSelectedClientName] = useState(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedClient");
      if (raw) {
        const { id, name } = JSON.parse(raw);
        setSelectedClientId(id || null);
        setSelectedClientName(name || null);
      }
    } catch {}
  }, []);

  // Persist whenever it changes
  useEffect(() => {
    sessionStorage.setItem(
      "selectedClient",
      JSON.stringify({ id: selectedClientId, name: selectedClientName })
    );
  }, [selectedClientId, selectedClientName]);

  const setSelectedClient = (id, name) => {
    setSelectedClientId(id || null);
    setSelectedClientName(name || null);
  };

  const clearSelectedClient = () => {
    setSelectedClientId(null);
    setSelectedClientName(null);
    sessionStorage.removeItem("selectedClient");
  };

  return (
    <SelectedClientContext.Provider
      value={{
        selectedClientId,
        selectedClientName,
        setSelectedClient,
        clearSelectedClient,
      }}
    >
      {children}
    </SelectedClientContext.Provider>
  );
}

export function useSelectedClient() {
  return useContext(SelectedClientContext);
}
