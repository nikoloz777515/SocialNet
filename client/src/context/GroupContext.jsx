import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const GroupContext = createContext();
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/groups`;

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/my-groups`, { credentials: "include" });
      const responseData = await res.json();
      if (res.ok) setGroups(responseData.data || []);
    } catch (err) {
      console.error("Fetch groups error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = async (groupData) => {
    const isFormData = groupData instanceof FormData;
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      credentials: "include",
      body: isFormData ? groupData : JSON.stringify(groupData)
    });

    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || "Error creating group");
    setGroups(prev => [...prev, responseData.data]);
    return responseData.data;
  };
const searchGroups = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/search?query=${query}`, { credentials: "include" });
      const responseData = await res.json();
      if (res.ok) setSearchResults(responseData.data || []);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${groupId}/join`, {
        method: 'POST',
        credentials: "include"
      });
      if (res.ok) await fetchGroups();
    } catch (err) { console.error(err.message); }
  };

  const deleteGroup = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${groupId}`, {
        method: 'DELETE',
        credentials: "include",
      });
      if (res.ok) {
        if (activeGroup?._id === groupId) setActiveGroup(null);
        setGroups(prev => prev.filter(g => g._id !== groupId));
      }
    } catch (err) { console.error("Delete error:", err.message); }
  };

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  return (
    <GroupContext.Provider value={{ groups,searchGroups, loading, activeGroup, fetchGroups, createGroup, joinGroup, deleteGroup, selectGroup: setActiveGroup,searchResults}}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);