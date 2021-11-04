// this will be our index 
let indexDB;

// connects to the indexed DB, calls it budget_tracker and sets ver to 1
const request = indexedDB.open('budget_tracker', 1);

// this will run if the version changes for any reason
request.onupgradeneeded = function(event) {

    // save a reference to the database
    const db = event.target.result;

    // creates a new object to store new transactions on, auto increments the associated ID
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// if we successfully write to the index DB
request.onsuccess = function(event) {

    // We save our result to the global let indexDB
    indexDB = event.target.result;
};

request.onerror = function(event) {
    // log any errors
    console.log(event.target.errorCode);
};

//this function fires off if network is offline
function saveRecord(record) {

    // runs a transaction function creating a new_transaction with readwrite permissions, saves to transaction const
    const transaction = indexDB.transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const  budgetObjectStore = transaction.objectStore('new_transaction');

    // adds to the scoped param
    budgetObjectStore.add(record);
}; 

function uploadData() {

    // open a transaction on the db
    const transaction = indexDB.transaction(['new_transaction'], 'readwrite');

    // accesses the objectStore
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // transfers all data onto getAll from bdugetObjectStore
    const getAll = budgetObjectStore.getAll();

    //on success of getAll run this functionn
    getAll.onsuccess = function() {

        // if there was data saved, we make a POST call through our api transaction route in routes/api.js
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    // open again
                    const transaction = indexDB.transaction(['new_transaction'], 'readwrite');

                    // access the new_transaction data
                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    // clear out the store when done to avoid duplicates
                    budgetObjectStore.clear();

                    alert("Don't worry, your data has been submitted!");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// when the app comes "online", call the function
window.addEventListener('online', uploadData); 

