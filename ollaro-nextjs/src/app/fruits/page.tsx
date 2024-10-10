'use client'
import { useState, useEffect } from 'react';

type Fruit = {
    _id: string;
    name: string;
};

export default function ItemList() {
    const [items, setItems] = useState<Fruit[]>([]);
    const [newItem, setNewItem] = useState('');
    const [isEditing, setIsEditing] = useState<number | null>(null); // Track the index of the item being edited
    const [editValue, setEditValue] = useState(''); // Store the current edit value
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const itemsPerPage = 5; // Items to show per page
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch items from the database
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/fruits');
                if (response.ok) {
                    const { data } = await response.json();
                    data.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
                    setItems(data)
                } else {
                    console.error('Failed to fetch items');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        fetchItems();
    }, []);

    // Function to add a new item
    const addItem = async () => {
        if (newItem.trim()) {
            try {
                const response = await fetch('/api/fruits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newItem }),
                });

                if (response.ok) {
                    const { data } = await response.json();
                    console.log(data)
                    setItems((prevItems) => [...prevItems, data]);
                    setNewItem('');
                } else {
                    console.error('Failed to add item');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }
    };

    const handleSearch = async () => {
        try {
          const response = await fetch(`/api/fruits/search?q=${searchQuery}`);
          if (response.ok) {
            const { data } = await response.json();
            // Sort the search results alphabetically by name
            data.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
            setItems(data);
          } else {
            console.error('Failed to search items');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
    };

    // Function to remove an item by index
    const removeItem = async (itemId: string, index: number) => {
        try {
        const fruitId = itemId;
    
        const response = await fetch(`/api/fruits/${fruitId}`, {
            method: 'DELETE',
        });
    
        if (response.ok) {
            // Remove the item from the local state if the deletion was successful
            setItems((prevItems) => prevItems.filter((_, i) => i !== index));
        } else {
            console.error('Failed to delete item');
        }
        } catch (error) {
        console.error('An error occurred:', error);
        }
    };

    // Function to start editing an item
    const startEditing = (index: number, itemVal: string) => {
        setIsEditing(index); // Set the index of the item being edited
        setEditValue(itemVal); // Set the edit value to the current item's value
    };

    // Function to handle saving the edited item
    const saveEdit = async (index: number, itemId: string) => {
        if (editValue.trim()) {
            try {
                const fruitId = itemId;

                const response = await fetch(`/api/fruits/${fruitId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: editValue }),
                });

                if (response.ok) {
                    console.log("ddddd")
                    const { data } = await response.json();
                    const updatedItems = [...items];
                    updatedItems[index] = data; // Update the item in the local state with the updated item from the response
                    setItems(updatedItems);
                    setIsEditing(null); // Exit edit mode
                } else {
                    console.error('Failed to update item');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }
    };

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-6">Fruit List</h1>
            <div className="mt-6 flex">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a fruit"
                    className="border border-gray-300 rounded-lg px-4 py-2 flex-grow mr-2"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Search
                </button>
            </div>
            <br>
            </br>
            <ul className="space-y-4">
                {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <li key={item._id} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                        {isEditing === index ? (
                            <>
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1 w-full mr-2"
                                />
                                <button
                                    onClick={() => saveEdit(index, item._id)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(null)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-gray-700 font-medium">{item.name}</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => startEditing(index, item.name)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => removeItem(item._id,index)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Next
                </button>
            </div>

            {/* Input to add new items */}
            <div className="mt-6 flex">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a new item"
                    className="border border-gray-300 rounded-lg px-4 py-2 flex-grow mr-2"
                />
                <button
                    onClick={addItem}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Add Item
                </button>
            </div>
        </div>
    );
}