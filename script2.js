var pageContainer = document.getElementById('container');
var commentSection = document.getElementById('last-comment-container');
var data;
var currentUser;

main();

async function main() {
    var storage = window.localStorage.data;
    if(storage) {
        data = await JSON.parse(storage);
    } else {
        var result = await fetch('data.json');
        data = await result.json();
        window.localStorage.data = JSON.stringify(data);
    }
    console.log(storage);
    console.log(data);
    currentUser = data['currentUser']['username'];
    var comments = data['comments'];
    var cardsContainer1 = document.createElement('div');
    cardsContainer1.classList.add('cards-container');
    comments.forEach((comment) => {
        var outerCard = getCard(currentUser, comment['id'], comment['user']['username'], comment['score'], comment['createdAt'], comment['content'], null);
        cardEvents(outerCard, currentUser);
        cardsContainer1.appendChild(outerCard);
        if(comment['replies'].length > 0) {

            var deepContainer = document.createElement('div');
            deepContainer.classList.add('deep-container');

            var gap = document.createElement('div');
            gap.classList.add('card-tab-line');

            var cardsContainer2 = document.createElement('div');
            cardsContainer2.classList.add('cards-container');

            comment['replies'].forEach((reply) => {
                var innerCard = getCard(currentUser, reply['id'], reply['user']['username'], reply['score'], reply['createdAt'], reply['content'], reply['replyingTo']);
                cardEvents(innerCard, currentUser);
                cardsContainer2.appendChild(innerCard);
            });

            deepContainer.appendChild(gap);
            deepContainer.appendChild(cardsContainer2)
            cardsContainer1.appendChild(deepContainer);
        }
    });
    pageContainer.appendChild(cardsContainer1);
    addCommentSection(data);    
}


function cardEvents(card, currentUser) {
    var currentCardId = parseInt(card.querySelector('.id').value);
    // ca.appendChild(card);

    // the state of the comment card of the current card
    var isCommentCardExpanded = false;

    // the text area of an editable comment
    var textAreaExpanded = false;

    // the final comment to send
    var finalComment = '';

    // get the buttons of the card
    var replyButtons = card.querySelectorAll('.reply-btn');
    var editButtons = card.querySelectorAll('.edit-btn');
    var deleteButtons = card.querySelectorAll('.delete-btn');
    var upVoteButtons = card.querySelectorAll('.fa-add');
    var downVoteButtons = card.querySelectorAll('.fa-minus');

    replyButtons.forEach((replyButton) => {
        replyButton.addEventListener('click', () => {
            if(isCommentCardExpanded === false) {
                var commentCard = insertCommentCard(currentUser);
                var commentButton = commentCard.querySelector('.comment-btn');
                var commentTextAreas = commentCard.querySelectorAll('.comment-input');
                commentTextAreas.forEach(commentTextArea => {
                    console.log(findCommentById(currentCardId));
                    commentTextArea.value = `@${findCommentById(currentCardId)['user']['username']} `;
                    finalComment = `@${findCommentById(currentCardId)['user']['username']} `;
                    commentTextArea.addEventListener('input', (e) => {
                        finalComment = e.target.value;
                        commentTextAreas.forEach(item => {
                            item.value = finalComment;
                        });
                    });
                });
                commentButton.addEventListener('click', () => {
                    commentCard.remove();
                    isCommentCardExpanded = false;
                    finalComment = finalComment.substring(findCommentById(currentCardId)['user']['username'].length + 2);
                    addReply(currentCardId, finalComment, findCommentById(currentCardId)['user']['username']);
                    window.location.reload();
                });
                card.parentNode.insertBefore(commentCard, card.nextSibling);
                isCommentCardExpanded = true;
            }
        });
    });
    
    editButtons.forEach((editButton) => {
        editButton.addEventListener('click', () => {
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
                flexContainer1.appendChild(getButton('update',['comment-btn', 'opacity-hover'], () => {
                    var newText = textArea.value.substring(findCommentById(currentCardId)['replyingTo'].length + 2);
                    editComment(currentCardId, newText);
                    window.location.reload();
                }));
                flexContainer2.appendChild(getButton('update',['comment-btn', 'opacity-hover'], () => {
                    var newText = textArea.value.substring(findCommentById(currentCardId)['replyingTo'].length + 2);
                    editComment(currentCardId, newText);
                    window.location.reload();
                }));

                comment.remove();
                container.appendChild(textArea);
                container.appendChild(flexContainer1);
                rightSection.appendChild(flexContainer2);
            }
            console.log('edit');
        });
    });

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener('click', () => {
            var modalContainer = document.querySelector('#modal-container');
            modalContainer.style.display = 'flex';
            var modal = getModal(
                () => {
                    console.log('canceled');
                    modalContainer.style.display = 'none';
                },
                () => {
                    console.log('deleted');
                    modalContainer.style.display = 'none';
                    deleteComment(currentCardId);
                    window.location.reload();
                }, 
            );
            modalContainer.appendChild(modal);
            console.log('delete');
        });
    });

    upVoteButtons.forEach((upVoteButton) => {
        upVoteButton.addEventListener('click', () => {
            editScore(currentCardId, true);
            window.location.reload();
        });
    });

    downVoteButtons.forEach((downVoteButton) => {
        downVoteButton.addEventListener('click', () => {
            editScore(currentCardId, false);
            window.location.reload();
        });
    });
}

function printer(text) {
    console.log('########################');
    console.log(text);
    console.log('########################');
}

function findCommentById(id) {
    var result = null;
    if(data !== null) {
        data['comments'].forEach((comment) => {
            if(comment['id'] === id) {
                result = comment;
                return;
            } else {
                comment['replies'].forEach((reply) => {
                    if(reply['id'] === id) {
                        result = reply;
                        return;
                    }
                });
            }
        });
    }
    return result;
}

function getNewId() {
    var max = 0;
    if(data !== null)
        data['comments'].forEach((comment) => {
            if(max < comment['id'])
                max = comment['id'];
            comment['replies'].forEach((reply) => {
                if(max < reply['id'])
                    max = reply['id'];
            });
        });
    return ++max;
}

function addReply(id, text, repyingTo) {
    var comment = findParentById(id);
    comment = (!comment) ? findCommentById(id) : comment;
    console.warn(comment)
    comment['replies'].push(
        {
            id: getNewId(),
            content: text,
            createdAt: "a moment ago",
            score: 0,
            replyingTo: repyingTo,
            user: {
                image: {
                    png: `./images/avatars/image-${currentUser}.png`,
                    webp: `./images/avatars/image-${currentUser}.webp`
                },
                username: currentUser
            }
        });
    saveData();
}

function findParentById(id) {
    var parent;
    data['comments'].forEach((comment) => {
        comment.replies.forEach((reply) => {
            if(reply['id'] === id)
                parent = comment;
        });
    });
    return parent;
}

function deleteComment(id) {
    var tempCommentsList = [];
    data['comments'].forEach((comment) => {
        var tempComment;
        var tempRepliesList = [];
        if(comment['id'] !== id) {
            tempComment = comment;
            comment['replies'].forEach((reply) => {
                if(reply['id'] !== id) {
                    tempRepliesList.push(reply);
                }
            });
            tempComment['replies'] = tempRepliesList;
            tempCommentsList.push(tempComment);
        }
    });
    data['comments'] = tempCommentsList;
    saveData();
}

function editComment(id, text) {
    data['comments'].forEach((comment) => {
        if(comment['id'] === id) {
            comment['content'] = text;
            console.log('should be edited');
            return;
        } else {
            comment['replies'].forEach((reply) => {
                if(reply['id'] === id) {
                    reply['content'] = text;
                    console.log('should be edited');
                    return;
                }
            });
        }
    });
    saveData();
}

function editScore(id, forUp) {
    var comment = findCommentById(id);
    if(forUp === true) {
        comment['score'] = comment['score'] + 1;
    } else {
        comment['score'] = comment['score'] - 1;
    }
    saveData();
}

function saveData() {
    window.localStorage.data = JSON.stringify(data);
}

// ui elements //////////////////////////////////////////////////////////////////////////////

function addCommentSection(data) {
    commentSection.innerHTML = `
        <div class="comment-card">
            <textarea name="" id="" rows="3" class="comment-input mobile-flex" placeholder="Add a comment..."></textarea>
            <img src="images/avatars/image-${data['currentUser']['username']}.png" alt="" class="comment-card-img">
            <textarea name="" id="" rows="3" class="comment-input desktop-flex" placeholder="Add a comment..."></textarea>
            <input type="button" value="send" class="comment-btn opacity-hover">
        </div>  
    `;
}

function insertCommentCard(currentUser) {
    var html = `
        <div class="comment-card">
            <textarea name="" id="" rows="3" class="comment-input mobile-flex" placeholder="Add a comment..."></textarea>
            <img src="images/avatars/image-${currentUser}.png" alt="" class="comment-card-img">
            <textarea rows="3" class="comment-input desktop-flex" placeholder="Add a new comment..."></textarea>
            <input type="button" value="send" class="comment-btn opacity-hover">
        </div>
    `;
    const template = document.createElement("div");
    template.classList.add('middle-comment-container');
    template.innerHTML = html.trim();
    return template;
}

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

function getCard(currentUser, id, userName, rate, duration, comment, replyTo) {
    var card = document.createElement('div');
    card.classList.add('card');
    var result = '';
    if(userName === currentUser) {
        result = `
            <input class="id" type="hidden" value="${id}"/>
            <div class="left-section desktop-flex">
                <div><i class="fa-solid fa-add rate-icon cursor-pointer"></i></div>
                <div class="likes-number">${rate}</div>
                <div><i class="fa-solid fa-minus rate-icon cursor-pointer"></i></div>
            </div>
            <div class="right-section">
                <div class="header">
                <div class="header-left">
                    <img src="images/avatars/image-${userName}.png" alt="" class="header-left-img">
                    <div class="header-left-name">${userName}</div>
                    <div class="header-left-tag">you</div>
                    <div class="header-left-duration">${duration}</div>
                </div>
                <div class="header-right desktop-flex">
                    <div class="header-right-btn delete-btn opacity-hover cursor-pointer">
                        <img class="header-right-img" src="images/icon-delete.svg" alt="reply">
                        <div class="header-right-text text-red">Delete</div>
                    </div>
                    <div class="header-right-btn edit-btn opacity-hover cursor-pointer">
                        <img class="header-right-img" src="images/icon-edit.svg" alt="reply">
                        <div class="header-right-text text-purple">Edit</div>
                    </div>
                </div>
                </div>
                <div class="card-content">
                <div class="card-content-comment">
                    <span class="comment-mention">${(replyTo !== null)? '@' + replyTo:''}</span> ${comment}
                </div>
                </div>
                <div class="card-footer mobile-flex">
                <div class="left-section">
                    <div><i class="fa-solid fa-add rate-icon cursor-pointer"></i></div>
                    <div class="likes-number">${rate}</div>
                    <div><i class="fa-solid fa-minus rate-icon cursor-pointer"></i></div>
                </div>
                <div class="header-right">
                    <div class="header-right-btn delete-btn opacity-hover cursor-pointer">
                        <img class="header-right-img" src="images/icon-delete.svg" alt="reply">
                        <div class="header-right-text text-red">Delete</div>
                    </div>
                    <div class="header-right-btn edit-btn opacity-hover cursor-pointer">
                        <img class="header-right-img" src="images/icon-edit.svg" alt="reply">
                        <div class="header-right-text text-purple">Edit</div>
                    </div>
                </div>
                </div>
            </div>
        `;
    } else {
        result = `
            <input class="id" type="hidden" value="${id}"/>
            <div class="left-section desktop-flex">
                <div><i class="fa-solid fa-add rate-icon cursor-pointer"></i></div>
                <div class="likes-number">${rate}</div>
                <div><i class="fa-solid fa-minus rate-icon cursor-pointer"></i></div>
            </div>
            <div class="right-section">
                <div class="header">
                <div class="header-left">
                    <img class="header-left-img" src="images/avatars/image-${userName}.png" alt="">
                    <div class="header-left-name">${userName}</div>
                    <div class="header-left-duration">${duration}</div>
                </div>
                <div class="header-right desktop-flex">
                    <div class="header-right-btn opacity-hover reply-btn cursor-pointer">
                        <img class="header-right-img" src="images/icon-reply.svg" alt="reply">
                        <div class="header-right-text text-purple">Reply</div>
                    </div>
                </div>
                </div>
                <div class="card-content">
                <div class="card-content-comment">
                    <span class="comment-mention">${(replyTo !== null)? '@' + replyTo:''}</span> ${comment}
                </div>
                </div>
                <div class="card-footer mobile-flex">
                <div class="left-section">                    
                    <div><i class="fa-solid fa-add rate-icon cursor-pointer"></i></div>
                    <div class="likes-number">${rate}</div>
                    <div><i class="fa-solid fa-minus rate-icon cursor-pointer"></i></div>
                </div>
                <div class="header-right mobile-flex">
                    <div class="header-right-btn opacity-hover reply-btn cursor-pointer">
                        <img class="header-right-img" src="images/icon-reply.svg" alt="reply">
                        <div class="header-right-text text-purple">Reply</div>
                    </div>
                </div>
                </div>
            </div>
        `;
    }
    card.innerHTML = result;
    return card;
}







































