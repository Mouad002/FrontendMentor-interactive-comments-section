

var card1 = document.getElementById('card1');
var cards = document.querySelectorAll('.card');

cards.forEach((card,index) => {
    // the state of the comment card of the current card
    var isCommentCardExpanded = false;
    // the text area of an editable comment
    var textAreaExpanded = false;

    // get the buttons of the card
    var replyButtons = card.querySelectorAll('.reply-btn');
    var editButtons = card.querySelectorAll('.edit-btn');
    var deleteButtons = card.querySelectorAll('.delete-btn');

    replyButtons.forEach((replyButton) => {
        // if(replyButton !== null) {
            replyButton.addEventListener('click', () => {
                showCommentArea();
                console.log('reply');
            });
        // }
    });
    
    editButtons.forEach((editButton) => {
        // if(editButton !== null) {
            editButton.addEventListener('click', () => {
                showTextArea();
                console.log('edit');
            });
        // }
    });

    deleteButtons.forEach((deleteButton) => {
        // if(deleteButton !== null) {
            deleteButton.addEventListener('click', () => {
                // card.remove();
                deleteComment();
                console.log('delete');
            });
        // }
    });

    // delete button function
    function deleteComment() {
        var modalContainer = document.querySelector('#modal-container');
        modalContainer.style.display = 'flex';
        var modal = getModal(
            (e) => {
                console.log('canceled');
                modalContainer.style.display = 'none';
            },
            (e) => {
                console.log('deleted');
                card.remove();
                modalContainer.style.display = 'none';
            }, 
        );
        modalContainer.appendChild(modal);
    }

    // reply button function
    function showCommentArea() {
        if(isCommentCardExpanded === false) {
            var commentCard = insertCommentCard(card);
            var commentButton = commentCard.querySelector('.comment-btn');
            commentButton.addEventListener('click', () => {
                commentCard.remove();
                isCommentCardExpanded = false;
            });
            isCommentCardExpanded = true;
        }
    }

    // edit button function
    function showTextArea() {
        if(textAreaExpanded === false) {
            textAreaExpanded = true;
            var container = card.querySelector('.card-content');
            var comment = card.querySelector('.card-content-comment');
            var rightSection = card.querySelector('.right-section');

            var textArea = document.createElement('textarea');
            textArea.classList.add('comment-edit-input');
            textArea.value = comment.innerText.trim();

            var flexContainer1 = flexBoxContainer('desktop-flex');
            var flexContainer2 = flexBoxContainer('mobile-flex');
            flexContainer1.appendChild(getButton('update',['comment-btn', 'opacity-hover'], () => {console.log('updated')}));
            flexContainer2.appendChild(getButton('update',['comment-btn', 'opacity-hover'], () => {console.log('updated')}));
            
            comment.remove();
            container.appendChild(textArea);
            container.appendChild(flexContainer1);
            rightSection.appendChild(flexContainer2);
        }
    }
});

function insertCommentCard(referenceNode) {
    var html = `
        <div class="comment-card">
            <textarea name="" id="" rows="3" class="comment-input mobile-flex" placeholder="Add a comment..."></textarea>
            <img src="images/avatars/image-amyrobson.png" alt="" class="comment-card-img">
            <textarea name="" id="" rows="3" class="comment-input desktop-flex" placeholder="Add a comment..."></textarea>
            <input type="button" value="send" class="comment-btn opacity-hover">
        </div>
    `;
    const template = document.createElement("div");
    template.classList.add('middle-comment-container');
    template.innerHTML = html.trim();
    referenceNode.parentNode.insertBefore(template, referenceNode.nextSibling);
    return template;
}

function addClasses(ob, li) {
    li.forEach((item) => {
        ob.classList.add(li);
    });
}

// ui elements //////////////////////////////////////////////////////////////////////////////

function getButton(value, classes, callbackFunction) {
    var input = document.createElement('input');
    input.value = value;
    input.type = 'button';
    input.addEventListener('click', callbackFunction);
    classes.forEach((item) => {
        input.classList.add(item);
    });
    return input;
}

function flexBoxContainer(className) {
    var flexContainer = document.createElement('div');
    flexContainer.style.justifyContent = 'end';
    flexContainer.classList.add(className);
    return flexContainer;
}

function getModal(canceledFunction, deleteFunction) {
    // create the modal
    var modal = document.createElement('div');
    modal.classList.add('modal');

    // the title
    var modalTitle = document.createElement('div');
    modalTitle.classList.add('modal-title');
    modalTitle.textContent = 'Delete comment';

    // the text
    var modalText = document.createElement('div');
    modalText.classList.add('modal-text');
    modalText.textContent = 'Are you sure you want to delete this comment? This will remove the comment and can\'t be undone.';

    // cancel button
    var cancelButton = document.createElement('input');
    cancelButton.type = 'button';
    cancelButton.value = 'No, Cancel';
    cancelButton.addEventListener('click', () => {
        canceledFunction();
        modal.remove();
    });
    cancelButton.classList.add('modal-button');
    cancelButton.classList.add('opacity-hover');

    // delete button
    var deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.value = 'Yes, Delete';
    deleteButton.addEventListener('click', () => {
        deleteFunction();
        modal.remove();
    });
    deleteButton.classList.add('modal-button');
    deleteButton.classList.add('opacity-hover');

    // create buttons container and add them to it 
    var modalButtons = document.createElement('div');
    modalButtons.classList.add('modal-buttons');
    modalButtons.appendChild(cancelButton);
    modalButtons.appendChild(deleteButton);

    // add all the elements to the modal
    modal.appendChild(modalTitle);
    modal.appendChild(modalText);
    modal.appendChild(modalButtons);

    return modal;
}

function makeCard(rateNumber) {
    // card
    var card = document.createElement('div');
    addClasses(card, ['card']);

    // the left part
    var leftSection = document.createElement('div');
    addClasses(leftSection, ['left-section', 'desktop-flex']);

    // upvote button
    var upvoteButton = document.createElement('a');
    var upvoteIcon = document.createElement('i');
    addClasses(upvoteIcon, ['fa-solid', 'fa-add', 'rate-icon']);
    upvoteButton.appendChild(upvoteIcon);

    // rate number
    var rate = document.createElement('div');
    addClasses(rate, ['likes-number']);
    rate.innerText = rateNumber;

    // downvote button
    var downvoteButton = document.createElement('a');
    var downvoteIcon = document.createElement('i');
    addClasses(downvoteIcon, ['fa-solid', 'fa-minus', 'rate-icon']);
    downvoteButton.appendChild(downvoteIcon);
    
    // fill the left part
    leftSection.appendChild(upvoteButton);
    leftSection.appendChild(rate);
    leftSection.appendChild(downvoteButton);

    // the right part
    var rightSection = document.createElement('div');
    addClasses(rightSection, ['right-section']);

    // header
    var header = document.createElement('div');
    addClasses(header, ['header']);

    var headerLeft = document.createElement('div');
    addClasses(headerLeft, ['header-left']);



    return card;
}

var c = document.getElementById('cards-container');
c.appendChild(getCard());
c.appendChild(getCard());
c.appendChild(getCard());


var result = await fetch(window.localStorage.data);
var data = await result.json();
console.log(data);

function getCard() {
    var card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="left-section desktop-flex">
            <a href="#"><i class="fa-solid fa-add rate-icon"></i></a>
            <div class="likes-number">19</div>
            <a href="#"><i class="fa-solid fa-minus rate-icon"></i></a>
        </div>
        <div class="right-section">
            <div class="header">
            <div class="header-left">
                <img class="header-left-img" src="images/avatars/image-amyrobson.png" alt="">
                <div class="header-left-name">amyrobson</div>
                <div class="header-left-duration">1 month ago</div>
            </div>
            <div class="header-right desktop-flex" href="#">
                <a class="header-right-btn opacity-hover reply-btn" href="#">
                <img class="header-right-img" src="images/icon-reply.svg" alt="reply">
                <div class="header-right-text text-purple">Reply</div>
                </a>
            </div>
            </div>
            <div class="card-content">
            <div class="card-content-comment">
                <span class="comment-mention">@amyrobson</span>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ducimus beatae voluptatum hic cumque aliquam vero veniam culpa omnis, placeat quidem, delectus deleniti minus enim natus! Quasi excepturi totam perferendis ut.
            </div>
            </div>
            <div class="card-footer mobile-flex">
            <div class="left-section">
                <a href="#"><i class="fa-solid fa-add rate-icon"></i></a>
                <div class="likes-number">19</div>
                <a href="#"><i class="fa-solid fa-minus rate-icon"></i></a>
            </div>
            <div class="header-right mobile-flex" href="#">
                <a class="header-right-btn opacity-hover reply-btn" href="#">
                <img class="header-right-img" src="images/icon-reply.svg" alt="reply">
                <div class="header-right-text text-purple">Reply</div>
                </a>
            </div>
            </div>
        </div>    
    `;
    return card;
}

// JSON testings ////////////////////////////////////////////////////////////////////////////

// fetch('data.json')
//     .then(results => results.json())
//     .then(value => console.log(value));
var user = {
    id: 12,
    name: 'happy meal',
    age: 24,
    height: 1.89
}
// var parsedUser = JSON.stringify(user);
// console.log(user);
// console.log(parsedUser)








































