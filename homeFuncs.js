async function markerDetailsModal(postData) {
    $("#modal-loading").modal('show');

    currentPost = postData;
    let created_posts = await getCreatedPostsData(currentUser);
    let saved_posts = await getSavedPostsData(currentUser);
    let owned = created_posts.find(post => post.globalId === postData.globalId);
    let saved = saved_posts.find(post => post.globalId === postData.globalId);

    if(owned) {
        document.getElementById("deleteMarker").style = "display: inline-block";
        document.getElementById("editMarker").style = "display: inline-block";
    } else {
        document.getElementById("deleteMarker").style = "display: none";
        document.getElementById("editMarker").style = "display: none";
    }

    if (saved) {
        document.getElementById("favMarker").textContent = "Unfavorite Post";
    } else {
        document.getElementById("favMarker").textContent = "Favorite Post";
    }

    $("#modal-loading").one("hidden.bs.modal", function () {
        //opens post details modal
        $("#detailsMarkerModal").modal();
    });
    $("#modal-loading").modal("hide");

    //populates modal with post data
    document.getElementById("markerTitle").innerHTML = `${postData.title}`;
    document.getElementById("markerLoc").innerHTML = `${postData.location}`;
    document.getElementById("markerDesc").innerHTML = `${postData.description}`;
    document.getElementById("markerRating").innerHTML = "";
    for(let i = 0; i < postData.ratings; i++){
        document.getElementById("markerRating").innerHTML = `${document.getElementById("markerRating").innerHTML}⭐`
    }


    if (postData.commentsEnabled) {
        loadComments(postData);

        document.getElementById("newCommentPost").addEventListener("click", () => {
            newPostComment(postData,document.getElementById("newComment").value,commentReply,commentReplyTarget);
            document.getElementById("newComment").value = "";
        }
    );
    } else {
        commentContainer.style = 'justify-content: center';
        commentContainer.innerHTML = 'Comments Are Not Enabled For This Post.';
        document.getElementById("newCommentContainer").style = 'display: none';
    }

    document.getElementById("pictureContainer").innerHTML = "";
    const imageContainer = document.getElementById("pictureContainer");
    postData.media.forEach(file => {
        const img = document.createElement("img");
        img.src = file.imageURL;
        img.alt = file.imageName;
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.paddingBottom = "10px";
        img.title = img.alt;
        imageContainer.appendChild(img);
    });
}

async function deleteData(){
    const text = "Are You Sure You Want To Delete This Post?\n(This Is Irreversible, And Your Post Will Be Gone Forever!)";
    if (confirm(text) == true) {
        try {
            // Fetch existing data
            const data = await getJSONData();
            const existingData = JSON.parse(data);
            
            let validUser = false;
            
            if(currentUser) {
                inputUser = currentUser;
            } else {
                inputUser = "testaccount";
            }
            
            const user = existingData.find(user => user.userName === inputUser);
            
            if (user){
                validUser = true;
                console.log("found user");
        
                let foundPost = user.posts.createdPosts.findIndex(post => post.id === currentPost.id);
                user.posts.createdPosts.splice(foundPost,1);
        
                if(currentUser) {
                } else {
                    alert("Warning: No SessionID Found, Defaulting To Save Changes Under testaccount!");
                }
                //updates JSONbin
                await putJSONData(existingData);
                // reset container
                let searchInput = document.querySelector('.search-bar').value;
                if (searchInput == ''){
                    getAllPosts();
                } else {
                    getSearchedPosts(searchInput);
                }
                $("#detailsMarkerModal").modal("hide");
            } else {
                throw new Error("Cannot Find User");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

var updatePostPhotos = [];
function editMarkerModal(markerData) {
    $("#updateMarkerModal").modal();

    document.getElementById("updateMarkerTitle").value = markerData.title;
    document.getElementById("updateMarkerLoc").value = markerData.location;
    document.getElementById("updateMarkerDesc").value = markerData.description;
    document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
    document.getElementById("updateMarkerRating").value = markerData.ratings;
    document.querySelectorAll('.star').forEach(s => {
        if (s.getAttribute('data-value') <= markerData.ratings) {
            s.classList.add('selected');
        } else {
            s.classList.remove('selected');
        }
    });
    document.querySelector('input[name="updateMarkerComments"]').checked = markerData.commentsEnabled;
    
    let pos = {
        latitude: markerData.latitude,
        longitude: markerData.longitude
    };

    updatePostPhotos = [];
    document.getElementById("update_previewContainer").innerHTML = "";
    document.getElementById('updateMarkerPics').value = '';

    markerData.media.forEach(file => {
        const img = document.createElement("img");
        img.src = file.imageURL;
        img.alt = file.imageName;
        img.style.maxWidth = "150px";
        img.title = "Click to Remove Image.";

        img.id = crypto.randomUUID();
        const imgInfo = {
            id: img.id,
            src: img.src,
            title: img.alt,
            file: false
        };
        updatePostPhotos.push(imgInfo);
        document.getElementById("update_previewContainer").appendChild(img);
    });
}

function createPostObject(postData) {
    const dashArea = document.querySelector('.content');
    const postCard = document.createElement('div');
    postCard.classList.add('card');

    postCard.dataset.postData = JSON.stringify(postData);

    const cardImg = document.createElement('img');
    cardImg.src = postData.media[0].imageURL;
    postCard.appendChild(cardImg);

    const cardTitle = document.createElement('h3');
    cardTitle.textContent = postData.title;
    postCard.appendChild(cardTitle);

    const cardLoc = document.createElement('p');
    cardLoc.textContent = postData.location;
    postCard.appendChild(cardLoc);

    const cardRating = document.createElement('p');

    for(let i = 0; i < postData.ratings; i++){
        cardRating.textContent = `${cardRating.textContent}⭐`
    }
    // cardRating.textContent = postData.ratings;
    postCard.appendChild(cardRating);

    const cardButton = document.createElement('button');
    cardButton.textContent = 'View Details';
    postCard.appendChild(cardButton);

    dashArea.appendChild(postCard);

    cardButton.addEventListener("click", function () {
        const savedPostData = JSON.parse(postCard.dataset.postData);
        markerDetailsModal(savedPostData);
    });
}

async function getPostsData(inputUser) {
    try {
        if(inputUser) {
        } else {
            alert("Warning: No SessionID Found, Defaulting To Use testaccount Data!");
            inputUser = "testaccount";
        }

        const data = await getJSONData();
        const existingData = JSON.parse(data);

        const user = existingData.find(user => user.userName === inputUser);

        if (user){
            const userPosts = user.posts.createdPosts;

            if (!Array.isArray(userPosts)) {
                throw new Error("Fetched user posts is not an array!");
            } else {
                return userPosts;
            }
        } else {
            throw new Error("User Cannot Be Found");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getAllPosts() {
    try {
        document.querySelector('.content').replaceChildren();
        const data = await getJSONData();
        const existingData = JSON.parse(data);

        // const user = existingData.foreach(user => await getPostsData(user.userName));

        for(let i = 0; i < existingData.length; i++){
            let posts = existingData[i].posts.createdPosts;
            posts.forEach(function(post) {
                createPostObject(post);
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getSearchedPosts(searchString) {
    document.querySelector('.content').replaceChildren();
    try {
        const data = await getJSONData();
        const existingData = JSON.parse(data);

        // const user = existingData.foreach(user => await getPostsData(user.userName));

        for(let i = 0; i < existingData.length; i++){
            let posts = existingData[i].posts.createdPosts;

            posts.forEach(function(post) {
                let titleSearch = post.title.search(searchString);
                let locationSearch = post.location.search(searchString);
                
                if((titleSearch != -1) || (locationSearch != -1)) {
                    createPostObject(post);
                };
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function updateData(flagNum,flagLoc,flagGlobId,flagComments) {
    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        
        let validUser = false;
        
        if(currentUser) {
            inputUser = currentUser;
        } else {
            inputUser = "testaccount";
        }
        
        const user = existingData.find(user => user.userName === inputUser);
        
        if (user){
            validUser = true;
            console.log("found user");
            let idNum = flagNum;

            uploadedImages = [];
            // console.log(uploadedImages);
            if((updatePostPhotos.length == 0) && (document.getElementById('updateMarkerPics').value == '')) {
                alert("Posts Need Atleast One Image!");
                throw new Error("No Image Data!");
            } else {
                for (const photo of updatePostPhotos) {
                    if (photo.file === false) {
                        const newImage = {
                            imageURL: photo.src
                        };
                        uploadedImages.push(newImage);
                    } else {
                        const uploadedImage = await uploadImage(photo.file);
                        if (uploadedImage) {
                            uploadedImages.push(uploadedImage);
                        } else {
                            throw new Error(`Image upload failed or returned null: ${photo.file}`);
                        }
                    }
                }
            }
    
            const newPost = {
                id: idNum,
                globalId: flagGlobId,
                title: document.getElementById("updateMarkerTitle").value,
                latitude: flagLoc.latitude,
                longitude: flagLoc.longitude,
                location: document.getElementById("updateMarkerLoc").value,
                description: document.getElementById("updateMarkerDesc").value,
                media: uploadedImages,
                ratings: document.getElementById('updateMarkerRating').value,
                commentsEnabled: document.querySelector('input[name="updateMarkerComments"]').checked,
                comments: flagComments
            };
            
            existingPost = user.posts.createdPosts.findIndex(post => post.id === newPost.id);
            user.posts.createdPosts[existingPost] = newPost;
    
    
            const validateInputs = [newPost];
            const found = validateInputs.find(item => Object.values(item).includes(""));
    
            if(found) {
                alert("Please Complete All Fields Before Posting!");
            } else {
                if(currentUser) {
                } else {
                    alert("Warning: No SessionID Found, Defaulting To Save Under testaccount!");
                }
                //updates JSONbin
                await putJSONData(existingData);
                //updates marker
                
                document.getElementById("updateMarkerForm").reset();
                document.getElementById("update_previewContainer").innerHTML = "";
                uploadedImages = [];
                // reset container
                let searchInput = document.querySelector('.search-bar').value;
                if (searchInput == ''){
                    getAllPosts();
                } else {
                    getSearchedPosts(searchInput);
                }
                $("#updateMarkerModal").modal("hide");
            }
        } else {
            throw new Error("Cannot Find User");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function favoritePost(flagGlobId) {
    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        
        let validUser = false;
        
        if(currentUser) {
            inputUser = currentUser;
        } else {
            inputUser = "testaccount";
        }
        
        const user = existingData.find(user => user.userName === inputUser);
        
        if (user){
            validUser = true;
            let idNum = 0;
            for(let i = 0; i < user.posts.savedPosts.length; i++){
                let postId = user.posts.savedPosts.find(post => post.id == idNum);
                if (postId) {
                    idNum++;
                } else {
                    break;
                }
            }
    
            const newFav = {
                id: idNum,
                globalId: flagGlobId
            };

            let toggleFav = true;
            if(user.posts.savedPosts.find(post => post.globalId === flagGlobId)) {
                user.posts.savedPosts.splice(user.posts.savedPosts.findIndex(post => post.globalId === flagGlobId),1);
                toggleFav = false;
            } else {
                user.posts.savedPosts[newFav.id] = newFav;
            }

            // saves data on JSONbin
            await putJSONData(existingData);

            if(toggleFav === true) {
                document.getElementById("favMarker").textContent = "Unfavorite Post";
            } else if(user.posts.createdPosts.find(owned => owned.globalId === newFav.globalId)) {
                document.getElementById("favMarker").textContent = "Favorite Post";
            } else {
                document.getElementById("favMarker").textContent = "Favorite Post";
            }

            // reset container
            let searchInput = document.querySelector('.search-bar').value;
            if (searchInput == ''){
                getAllPosts();
            } else {
                getSearchedPosts(searchInput);
            }
        } else {
            throw new Error("Cannot Find User");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function newPostComment(postData,commentText,isReply,replyTarget) {
    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        
        let validUser = false;
        
        if(currentUser) {
            inputUser = currentUser;
        } else {
            inputUser = "testaccount";
        }
        
        const user = existingData.find(user => user.userName === inputUser);
        
        if (user){
            let foundPost;
            for(let i = 0; i < existingData.length; i++){
                let posts = existingData[i].posts.createdPosts;
                foundPost = posts.find(post => post.globalId === postData.globalId);
                
                if (foundPost) {
                    if (isReply) {
                        let foundComment = foundPost.comments.find(comment => comment.id === isReply.id);

                        let idNum = 0;
                        for(let i = 0; i < foundComment.replies.length; i++){
                            let replyId = foundComment.replies.find(reply => reply.id == idNum);
                            if (replyId) {
                                idNum++;
                            } else {
                                break;
                            }
                        }

                        const newReply = {
                            id: idNum,
                            username: user.userName,
                            content: commentText,
                            target: replyTarget
                        };

                        foundComment.replies[newReply.id] = newReply;
                    } else {
                        let idNum = 0;
                        for(let i = 0; i < foundPost.comments.length; i++){
                            let commentId = foundPost.comments.find(comment => comment.id == idNum);
                            if (commentId) {
                                idNum++;
                            } else {
                                break;
                            }
                        }

                        const newComment = {
                            id: idNum,
                            username: user.userName,
                            content: commentText,
                            replies: []
                        };

                        foundPost.comments[newComment.id] = newComment;
                    }
                    loadComments(foundPost);
                    break;
                }
            }

            if(foundPost) {
            } else {
                throw new Error(`Cannot Find Post With ID: ${postData.globalId}`);
            }   

            await putJSONData(existingData);

            document.getElementById("newReply").innerText = '';
            document.getElementById("cancelReply").style = "display: none";
            commentReply = undefined;
            commentReplyTarget = undefined;
            // reset container
            let searchInput = document.querySelector('.search-bar').value;
            if (searchInput == ''){
                getAllPosts();
            } else {
                getSearchedPosts(searchInput);
            }
        } else {
            throw new Error("Cannot Find User");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function loadComments(markerData) {
    document.getElementById("newCommentContainer").style.display = "";

    if (markerData.comments.length === 0) {
        const commentContainer = document.getElementById("commentContainer");

        commentContainer.style.width = "100%";
        commentContainer.style.height = "100px";
        commentContainer.style = 'justify-content: center';
        commentContainer.innerHTML = "No Comments So Far, Be The First To Post!";
    } else {
        commentContainer.innerHTML = "";
        commentContainer.style = 'justify-content: left';

        markerData.comments.forEach(comment => {

            const commentCard = document.createElement('div');
            commentCard.classList.add('commentCard');

            const cardUserName = document.createElement('h4');
            cardUserName.textContent = comment.username;
            commentCard.appendChild(cardUserName);

            const cardContent = document.createElement('p');
            cardContent.textContent = comment.content;
            commentCard.appendChild(cardContent);

            const cardButtonDiv = document.createElement('div');
            cardButtonDiv.classList.add('commentButtonDiv');
            commentCard.appendChild(cardButtonDiv);

            const cardButton = document.createElement('button');
            cardButton.textContent = 'Reply';
            cardButton.classList.add('btn','btn-info');
            cardButtonDiv.appendChild(cardButton);
            cardButton.addEventListener("click", () =>  {
                document.getElementById("newReply").innerText = `Replying to ${comment.username}..`;
                document.getElementById("cancelReply").style = "display: block";
                commentReply = comment;
                commentReplyTarget = comment.username;
            });

            if(currentUser) {
                inputUser = currentUser;
            } else {
                inputUser = "testaccount";
            }
            if(comment.username === inputUser) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('btn','btn-danger');
                cardButtonDiv.appendChild(deleteButton);
                deleteButton.addEventListener("click", async () =>  {
                    let deletedComment = markerData.comments.findIndex(deleteComment => deleteComment.id === comment.id);
                    markerData.comments.splice(deletedComment,1);
                    sendCommentData(markerData);
                    loadComments(markerData);
                });
            }

            commentContainer.appendChild(commentCard);

            comment.replies.forEach (reply => {
                const replyCard = document.createElement('div');
                replyCard.classList.add('commentCard','replyCard');

                const replyUserName = document.createElement('h4');
                replyUserName.textContent = `${reply.username} => ${reply.target}`;
                replyCard.appendChild(replyUserName);

                const replyContent = document.createElement('p');
                replyContent.textContent = reply.content;
                replyCard.appendChild(replyContent);

                const replyCardButtonDiv = document.createElement('div');
                replyCardButtonDiv.classList.add('commentButtonDiv');
                replyCard.appendChild(replyCardButtonDiv);

                const replyButton = document.createElement('button');
                replyButton.textContent = 'Reply';
                replyButton.classList.add('btn','btn-info');
                replyCardButtonDiv.appendChild(replyButton);
                replyButton.addEventListener("click", () =>  {
                    document.getElementById("newReply").innerText = `Replying to ${reply.username}..`;
                    document.getElementById("cancelReply").style = "display: block";
                    commentReply = comment;
                    commentReplyTarget = reply.username;
                });

                if(currentUser) {
                    inputUser = currentUser;
                } else {
                    inputUser = "testaccount";
                }
                if(reply.username === inputUser) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('btn','btn-danger');
                    replyCardButtonDiv.appendChild(deleteButton);
                    deleteButton.addEventListener("click", async () =>  {
                        let deletedReply = comment.replies.findIndex(deleteReply => deleteReply.id === reply.id);
                        comment.replies.splice(deletedReply,1);
                        await sendCommentData(markerData);
                        loadComments(markerData);
                    });
                }

                commentContainer.appendChild(replyCard);
            });
        });
    }
}

async function sendCommentData(postData){
    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        
        if(currentUser) {
            inputUser = currentUser;
        } else {
            inputUser = "testaccount";
        }
        
        for(let i = 0; i < existingData.length; i++){
            let posts = existingData[i].posts.createdPosts;
            foundPost = posts.find(post => post.globalId === postData.globalId);
            
            if (foundPost) {
                foundPost.comments = postData.comments;
                await putJSONData(existingData);
                // reset container
                let searchInput = document.querySelector('.search-bar').value;
                if (searchInput == ''){
                    getAllPosts();
                } else {
                    getSearchedPosts(searchInput);
                }
                break;
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getCreatedPostsData(inputUser) {
    try {
        if(inputUser) {
        } else {
            // alert("Warning: No SessionID Found, Defaulting To Use testaccount Data!");
            inputUser = "testaccount";
        }

        const data = await getJSONData();
        const existingData = JSON.parse(data);

        const user = existingData.find(user => user.userName === inputUser);

        if (user){
            const userPosts = user.posts.createdPosts;

            if (!Array.isArray(userPosts)) {
                throw new Error("Fetched user posts is not an array!");
            } else {
                return userPosts;
            }
        } else {
            throw new Error("User Cannot Be Found");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getSavedPostsData(inputUser) {
    try {
        if(inputUser) {
        } else {
            // alert("Warning: No SessionID Found, Defaulting To Use testaccount Data!");
            inputUser = "testaccount";
        }

        const data = await getJSONData();
        const existingData = JSON.parse(data);

        const user = existingData.find(user => user.userName === inputUser);

        if (user){
            const userPosts = user.posts.savedPosts;

            if (!Array.isArray(userPosts)) {
                throw new Error("Fetched user posts is not an array!");
            } else {
                return userPosts;
            }
        } else {
            throw new Error("User Cannot Be Found");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function uploadImage(selectedImage) {
    if (!selectedImage) {
        alert("Please select an image to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("key", imgbbApiKey);
    try {
        const response = await fetch(imgbbUploadEndpoint, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            const imageUrl = data.data.url;
            const imageName = selectedImage.name;

            // Add the new image to the uploadedImages array
            // const newImage = {
            //     imageName: imageName,
            //     imageURL: imageUrl
            // };
            const newImage = {
                imageURL: imageUrl
            };
            
            return newImage;
        } else {
            console.error("Error response from ImgBB:", data);
            alert("Image upload failed. Please try again.");
            return null;
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
        return null;
    }
}

async function getUserStatus() {
    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        
        if(currentUser) {
            inputUser = currentUser;
        } else {
            inputUser = "testaccount";
        }
        
        const user = existingData.find(user => user.userName === inputUser);
        
        if (user){
            if(user.new === true) {
                document.getElementById('cta').style.display = "block";
                user.new = false;
            } else {
                console.log(`${user.userName} Is A Returning User.`)
            }
            await putJSONData(existingData);
        } else {
            throw new Error("Cannot Find User");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

document.getElementById('updateMarkerPics').addEventListener('change', evt => {
    const imageContainer = document.getElementById("update_previewContainer");
    let photos = evt.target.files;

    Array.from(photos).forEach(file => {
        const isDuplicate = updatePostPhotos.some(
            imgInfo => imgInfo.file && imgInfo.file.name === file.name
        );
        if (!isDuplicate) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.alt = String(file.name);
            img.style.maxWidth = "150px";
            img.title = "Click to Remove Image.";

            // let idNum = 0;
            // while (updatePostPhotos.find(img => img.id == idNum)) {
            //     idNum++;
            // }

            img.id = crypto.randomUUID();;

            const imgInfo = {
                id: img.id,
                src: img.src,
                title: img.alt,
                file: file
            };

            updatePostPhotos.push(imgInfo);
            imageContainer.appendChild(img);
        }
    });
});


document.getElementById("update_previewContainer").addEventListener("click", event => {
    if (event.target.tagName === "IMG") { 
        const elmID = updatePostPhotos.findIndex(img => img.id == event.target.id);
        if (elmID !== -1) {
            updatePostPhotos.splice(elmID,1);
            event.target.remove();
            // can add more functionality here
        }
    }
});


// EVENT LISTENERS FOR MODALS BELOW:

document.getElementById("updateMarker").addEventListener("click", () =>  updateData(currentPost.id,
    {latitude: currentPost.latitude,longitude: currentPost.longitude},
currentPost.globalId,currentPost.comments));


document.getElementById('updateMarkerForm').addEventListener('submit', function(event) {event.preventDefault()});


document.getElementById("deleteMarker").addEventListener("click", deleteData);
document.getElementById("favMarker").addEventListener("click", () =>  favoritePost(currentPost.globalId));
document.getElementById("cancelReply").addEventListener("click", () =>  {
    document.getElementById("newReply").innerText = '';
    document.getElementById("cancelReply").style = "display: none";
    commentReply = undefined;
    commentReplyTarget = undefined;
});
document.getElementById("editMarker").addEventListener("click", () =>  {
    $("#detailsMarkerModal").modal("hide");
    $("#detailsMarkerModal").one("hidden.bs.modal", function () {
        editMarkerModal(currentPost);
    });
});

document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
    const rating = star.getAttribute('data-value');
    document.getElementById('newMarkerRating').value = rating;
    document.getElementById('updateMarkerRating').value = rating;

    // Highlight the selected stars
    document.querySelectorAll('.star').forEach(s => {
        if (s.getAttribute('data-value') <= rating) {
                s.classList.add('selected');
            } else {
                s.classList.remove('selected');
            }
        });
    });
});


// WEBPAGE CODE & FUNCS BELOW:

var commentReply;
var commentReplyTarget;
var commentPostedData;
let currentPost;
const currentUser = sessionStorage.getItem("currUserNm");
const imgbbApiKey = "0174bc761b940e06f83428e9de24aa0c";
const imgbbUploadEndpoint = "https://api.imgbb.com/1/upload";
var uploadedImages = [];

// document.getElementById("homePage").addEventListener("click", () => {
//     window.location.href("homepage.html");
// });
// document.getElementById("userProfile").addEventListener("click", () => {
//     window.location.href("dashboard.html");
// });
document.getElementById("logOut").addEventListener("click", () => {
    sessionStorage.removeItem("currUserNm");
    window.location.replace("login.html");
});

window.onload = function() {
    if (!currentUser) {
        window.location.replace("login.html");
    } else {
        console.log('Page loaded');
        getUserStatus();
        getAllPosts();
    
        const searchBar = document.querySelector(".search-bar");
        searchBar.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                let searchInput = document.querySelector('.search-bar').value;
    
                if (searchInput == ''){
                    getAllPosts();
                } else {
                    getSearchedPosts(searchInput);
                }
            }
        });
    }
};