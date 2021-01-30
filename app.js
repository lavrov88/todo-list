let newTaskInput = document.querySelector('#newTaskInput'),
    addTaskButton = document.querySelector('#addTaskButton'),
    taskList = document.querySelector('#taskList'),
    tasksArr = [],
    editModeOn = false,
    newItemId = null;

readFromLocalStorage();

newTaskInput.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {
        addNewTask();
    }
});

addTaskButton.addEventListener('click', addNewTask);

taskList.addEventListener('change', function(event) {    
    if (event.target.getAttribute('type') == 'checkbox') {
        let changedItem = parseId(event.target.getAttribute('id'));
        if (event.target.checked) {
            tasksArr[changedItem].checked = true;            
        } else {
            tasksArr[changedItem].checked = false;
        }
        refreshAfterTimeOut(0);
    }
});

taskList.addEventListener('click', function(event) {
    let itemId = parseId(event.target.closest('.task-item').querySelector('.task-checkbox').id);
    console.log(event.target);

    if (event.target.classList.contains('important-btn') || event.target.classList.contains('important-btn-text')) {
        changeImportant(itemId);
    } else if (event.target.classList.contains('delete-btn')) {
        deleteItem(itemId);
    } else if (event.target.classList.contains('up-btn') || event.target.classList.contains('up-btn-text')) {
        changeWithPrevious(itemId);
    } else if (event.target.classList.contains('down-btn') || event.target.classList.contains('down-btn-text')) {
        changeWithNext(itemId);
    } else if (event.target.classList.contains('edit-btn') || event.target.classList.contains('edit-btn-text')) {
        editItem(itemId);
    }
});

document.addEventListener('click', function(event){
    if (editModeOn && event.target.id != 'editingInput') {
        console.log(`editmode was ${editModeOn}, now it's false`);
        editModeOn = false;
        displayTaskList();
    }
})

function editItem(itemId) {    
    if (editModeOn) {
        return;
    }

    let currentValue = tasksArr[itemId].value,
        currentId = '#item_' + itemId,
        currentLabel = taskList.querySelector(currentId).nextElementSibling;
    currentLabel.innerHTML = `<input id="editingInput" class="editing-input" type="text" value="${currentValue}">`;
    let editingInput = taskList.querySelector('#editingInput');
    editingInput.focus();
    editingInput.selectionStart = editingInput.value.length;
    
    editingInput.addEventListener('change', function(){
        tasksArr[itemId].value = editingInput.value;
        refreshAfterTimeOut(0);
    });

    setTimeout(() => {
        editModeOn = true;
    }, 10);
}

function changeWithPrevious(itemId) {
    if (itemId > 0) {
        let temp = tasksArr[itemId - 1];
        tasksArr[itemId - 1] = tasksArr[itemId];
        tasksArr[itemId] = temp;

        taskList.querySelector('#item_' + itemId).closest('.task-item').classList.add('move-up');
        taskList.querySelector('#item_' + itemId).closest('.task-item').previousElementSibling.classList.add('move-down');

        refreshAfterTimeOut(210);
    }
}

function changeWithNext(itemId) {
    if (itemId < tasksArr.length - 1) {
        let temp = tasksArr[itemId + 1];
        tasksArr[itemId + 1] = tasksArr[itemId];
        tasksArr[itemId] = temp;

        taskList.querySelector('#item_' + itemId).closest('.task-item').classList.add('move-down');
        taskList.querySelector('#item_' + itemId).closest('.task-item').nextElementSibling.classList.add('move-up');

        refreshAfterTimeOut(210);
    }
}

function deleteItem(itemId) {
    tasksArr.splice(itemId, 1);
    taskList.querySelector('#item_' + itemId).closest('.task-item').classList.add('deleted');
    refreshAfterTimeOut(310);
}

function changeImportant(itemId) {
    if (tasksArr[itemId].important) {
        tasksArr[itemId].important = false;
    } else {
        tasksArr[itemId].important = true;
    }
    refreshAfterTimeOut(0);
}

function refreshAfterTimeOut(time) {
    setTimeout(() => {            
        displayTaskList();
        localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
    }, time);
}

function parseId(string) {
    return parseInt(string.replace(/\D+/g,""));
}

function readFromLocalStorage() {
    if (localStorage.getItem('tasksArr')) {
        tasksArr = JSON.parse(localStorage.getItem('tasksArr'));
        displayTaskList();
    }
}

function addNewTask() {
    if (newTaskInput.value === '') {
        document.querySelector('#newTaskInput').focus();
        return;
    }
    let newTask = {
        value: newTaskInput.value,
        checked: false,
        important: false,
    };
    tasksArr.push(newTask);
    newItemId = tasksArr.length - 1;
    newTaskInput.value = '';
    refreshAfterTimeOut(0);

    setTimeout(() => {
        taskList.querySelector('#item_' + newItemId).closest('.task-item').classList.remove('new');
        newItemId = null;
    }, 10);

    document.querySelector('#newTaskInput').focus();
}

function trimValue(value) {
    if (value.length > 25) {
        return value.substring(0, 25) + '...';
    } else {
        return value;
    }
}

function displayTaskList() {
    let taskItem = '';

    if (tasksArr.length === 0) {
        taskList.innerHTML = `
        <li class="task-item task-item-empty">Задач пока нет...</li>
        `;
    } else {
        tasksArr.forEach(function(item, i) {
            taskItem += `
            <li class="task-item ${i === newItemId ? "new" : ""}">
                <div class="task-item-left">
                    <input class="task-checkbox" type="checkbox" id="item_${i}" ${item.checked ? "checked" : ""}>
                    <label class="${item.important ? "important" : ""} ${item.checked ? "checked" : ""}" for="item_${i}">${trimValue(item.value)}</label>
                </div>
                <div class="task-item-right">
                    <button class="list-btn edit-btn">
                        <span class="edit-btn-text">&#9998;</span>
                    </button>
                    <div class="up-down-block">
                        <button class="list-btn half-btn up-btn">
                            <span class="up-btn-text"></span>
                        </button>
                        <button class="list-btn half-btn down-btn">
                            <span class="down-btn-text"></span>
                        </button>
                    </div>                    
                    <button class="list-btn important-btn">
                        <span class="important-btn-text">!</span>
                    </button>
                    <button class="list-btn delete-btn">
                    </button>
                </div>
            </li>
            `;
            taskList.innerHTML = taskItem;
        });
    }
}