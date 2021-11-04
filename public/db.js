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

//this goes off if we attempt to write to the offline site.
function saveRecord(record) {

    // uses a built in transaction function, with the params of a new transaction that has both read and write permissions
    const transaction = indexDB.transaction(['new_transaction'], 'readwrite');

    // pass this transaction data onto budgetObjectStore
    const  budgetObjectStore = transaction.objectStore('new_transaction');

    // places the data onto the scoped record
    budgetObjectStore.add(record);
}; 



