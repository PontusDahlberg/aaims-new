import Button from "./ui/Button";
import Card from "./ui/Card";
import { useState, useEffect } from "react";

export default function TrashCanPopup({ onClose, darkMode, deletedMeetings, onRestoreMeeting, onPermanentDeleteMeeting, setDeletedMeetings }) {
  const [deletedItems, setDeletedItems] = useState(deletedMeetings);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('deleted-items');
      console.log('Raw saved items:', savedItems); // Debug log
      
      const parsedItems = savedItems ? JSON.parse(savedItems) : [];
      console.log('Parsed items:', parsedItems); // Debug log
      
      // Create a Map for deduplication
      const itemMap = new Map();
      
      // Add items from props first
      deletedMeetings.forEach(item => {
        itemMap.set(item.id, item);
      });
      
      // Then add items from localStorage
      parsedItems.forEach(item => {
        // Kontrollera att objektet har rätt struktur och ett giltigt id
        if (item && item.id && (item.type === 'meeting' || item.type === 'note')) {
          itemMap.set(item.id, item);
        }
      });

      const uniqueItems = Array.from(itemMap.values())
        .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

      console.log('Final unique items:', uniqueItems); // Debug log
      setDeletedItems(uniqueItems);
      
    } catch (error) {
      console.error('Error loading deleted items:', error);
      setDeletedItems(deletedMeetings);
    }
  }, [deletedMeetings]); // Only depend on deletedMeetings prop

  const sortedItems = [...deletedItems].sort((a, b) => 
    new Date(b.deletedAt) - new Date(a.deletedAt)
  );

  const handleRestoreItem = (itemId) => {
    const itemToRestore = sortedItems.find(item => item.id === itemId);
    if (!itemToRestore) return;

    // Uppdatera deleted items listan först
    const updatedDeletedItems = deletedItems.filter(item => item.id !== itemId);
    setDeletedItems(updatedDeletedItems);
    setDeletedMeetings(updatedDeletedItems);

    if (itemToRestore.type === 'note' || itemToRestore.type === 'meetingNote') {
      // Återställ anteckning till rätt plats
      const storageKey = itemToRestore.type === 'note' 
        ? 'general-notes' 
        : `meeting-notes-${itemToRestore.meetingId}`;
      
      const savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedNotes = [{
        id: itemToRestore.id,
        text: itemToRestore.text,
        timestamp: itemToRestore.timestamp
      }, ...savedNotes];
      
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      window.dispatchEvent(new Event('storage'));
    } else {
      // Återställ möte
      onRestoreMeeting(itemId);
    }

    // Uppdatera deleted-items i localStorage
    localStorage.setItem('deleted-items', JSON.stringify(updatedDeletedItems));
  };

  const handlePermanentDelete = (itemId) => {
    // Ta bort item från listan
    const updatedItems = deletedItems.filter(item => item.id !== itemId);
    setDeletedItems(updatedItems);
    setDeletedMeetings(updatedItems);
    
    // Spara den uppdaterade listan i localStorage
    localStorage.setItem('deleted-items', JSON.stringify(updatedItems));
    
    // Om det är ett möte, anropa API
    const item = deletedItems.find(item => item.id === itemId);
    if (item.type === 'meeting') {
      onPermanentDeleteMeeting(itemId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className={darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}>
        <h2 className="text-xl font-bold mb-4">
          Papperskorg ({deletedItems.length}) 
          <span className="text-sm font-normal ml-2">
            (Möten: {deletedItems.filter(item => item.type === 'meeting').length}, 
             Anteckningar: {deletedItems.filter(item => item.type === 'note' || item.type === 'meetingNote').length})
          </span>
        </h2>
        
        {deletedItems.length === 0 ? (
          <p className="text-gray-500">Papperskorgen är tom.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {sortedItems.map((item) => (
              <li key={item.id} className={`p-4 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">
                        {item.type === 'note' ? 'Anteckning' : 
                         item.type === 'meetingNote' ? 'Mötesanteckning' : 
                         'Möte'}
                      </span>
                      <p className="text-sm text-gray-500">
                        Borttagen: {new Date(item.deletedAt).toLocaleString('sv-SE')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm">
                    {item.type === 'note' || item.type === 'meetingNote' 
                      ? item.text 
                      : item.summary}
                  </p>

                  <div className="flex justify-end mt-4 space-x-2">
                    <Button onClick={() => handleRestoreItem(item.id)}>
                      Återställ
                    </Button>
                    <Button 
                      className="bg-red-500 hover:bg-red-600" 
                      onClick={() => handlePermanentDelete(item.id)}
                    >
                      Ta bort permanent
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Stäng</Button>
        </div>
      </Card>
    </div>
  );
}
