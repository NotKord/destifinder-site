let newPostPhotos = [];
function newMarkerEntryModal() {
    $("#newMarkerModal").modal();
    document.getElementById("new_previewContainer").innerHTML = "";
    document.getElementById('newMarkerPics').value = '';
    newPostPhotos = [];
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
                //deletes marker
                let deletedMarker = markerArray.findIndex(marker => marker.data.globalId === currentPost.globalId);
                markerArray[deletedMarker].setMap(null);
                markerArray.splice(deletedMarker,1);
                populateSavedPosts(currentUser);
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
    document.querySelector(`input[name="updateMarkerRating"][value="${markerData.ratings}"]`).checked = true;
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

async function markerDetailsModal(markerData) {
    $("#modal-loading").modal('show');

    let created_posts = await getCreatedPostsData(currentUser);
    let saved_posts = await getSavedPostsData(currentUser);
    let owned = created_posts.find(post => post.globalId === markerData.globalId);
    let saved = saved_posts.find(post => post.globalId === markerData.globalId);

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
    document.getElementById("markerTitle").innerHTML = `${markerData.title}`;
    document.getElementById("markerLoc").innerHTML = `${markerData.location}`;
    document.getElementById("markerDesc").innerHTML = `${markerData.description}`;
    document.getElementById("markerRating").innerHTML = "";
    for(let i = 0; i < markerData.ratings; i++){
        document.getElementById("markerRating").innerHTML = `${document.getElementById("markerRating").innerHTML}⭐`
    }


    if (markerData.commentsEnabled) {
        loadComments(markerData);

        document.getElementById("newCommentPost").addEventListener("click", () => {
            newPostComment(markerData,document.getElementById("newComment").value,commentReply,commentReplyTarget);
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
    markerData.media.forEach(file => {
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

async function submitData() {
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
        for(let i = 0; i < user.posts.createdPosts.length; i++){
            let postId = user.posts.createdPosts.find(post => post.id == idNum);
            if (postId) {
                idNum++;
            } else {
                break;
            }
        }

        uploadedImages = [];
        for (const photo of newPostPhotos) {
            // await uploadImage(photo.file);
            const uploadedImage = await uploadImage(photo.file);
            if (uploadedImage) {
                uploadedImages.push(uploadedImage);
            } else {
                throw new Error(`Image upload failed or returned null: ${photo.file}`);
            }
        }

        let generatedGlobalID = `${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

        const newPost = {
            id: idNum,
            globalId: generatedGlobalID,
            title: document.getElementById("newMarkerTitle").value,
            latitude: currentLatLng.lat(),
            longitude: currentLatLng.lng(),
            location: document.getElementById("newMarkerLoc").value,
            description: document.getElementById("newMarkerDesc").value,
            media: uploadedImages,
            ratings: document.querySelector('input[name="newMarkerRating"]:checked')?.value,
            commentsEnabled: document.querySelector('input[name="newMarkerComments"]').checked,
            comments: []
        };

        user.posts.createdPosts[newPost.id] = newPost;


        const validateInputs = [newPost];
        const found = validateInputs.find(item => Object.values(item).includes(""));

        if(found) {
            alert("Please Complete All Fields Before Posting!");
        } else {
            if(currentUser) {
            } else {
                alert("Warning: No SessionID Found, Defaulting To Save Under testaccount!");
            }
            //saves data on JSONbin
            await putJSONData(existingData);
            // this allows for the marker's color and icon to update in real-time rather than after a refresh
            const pos = {
                lat: newPost.latitude,
                lng: newPost.longitude
            };
            placeMarkerAndPanTo(pos, currentMap, newPost, 1);
            
            document.getElementById("newMarkerForm").reset();
            document.getElementById("new_previewContainer").innerHTML = "";
            uploadedImages = [];
            $("#newMarkerModal").modal("hide");
            newPost_Marker = true;
        }
    } else {
        throw new Error("Cannot Find User");
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
                ratings: document.querySelector('input[name="updateMarkerRating"]:checked')?.value,
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
                const updatedMarker = markerArray.find(marker => marker.data.globalId === newPost.globalId);
                updatedMarker.setMap(null);
                const pos = {
                    lat: newPost.latitude,
                    lng: newPost.longitude
                };
                if(user.posts.savedPosts.find(saved => saved.globalId === newPost.globalId)) {
                    placeMarkerAndPanTo(pos, currentMap, newPost, 2);
                    populateSavedPosts(currentUser);
                } else {
                    placeMarkerAndPanTo(pos, currentMap, newPost, 1);
                }

                document.getElementById("updateMarkerForm").reset();
                document.getElementById("update_previewContainer").innerHTML = "";
                uploadedImages = [];
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

            favoritedMarker = markerArray.find(post => post.data.globalId === newFav.globalId);
            favoritedMarker.setMap(null);
            const pos = {
                lat: favoritedMarker.data.latitude,
                lng: favoritedMarker.data.longitude
            };

            if(toggleFav === true) {
                placeMarkerAndPanTo(pos, currentMap, favoritedMarker.data, 2);
                document.getElementById("favMarker").textContent = "Unfavorite Post";
            } else if(user.posts.createdPosts.find(owned => owned.globalId === favoritedMarker.data.globalId)) {
                placeMarkerAndPanTo(pos, currentMap, favoritedMarker.data, 1);
                document.getElementById("favMarker").textContent = "Favorite Post";
            } else {
                placeMarkerAndPanTo(pos, currentMap, favoritedMarker.data);
                document.getElementById("favMarker").textContent = "Favorite Post";
            }

            populateSavedPosts(currentUser);
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
            const updatedMarkerComments = markerArray.find(marker => marker.data.globalId === foundPost.globalId);
            updatedMarkerComments.data = foundPost;

            document.getElementById("newReply").innerText = '';
            document.getElementById("cancelReply").style = "display: none";
            commentReply = undefined;
            commentReplyTarget = undefined;
            populateSavedPosts(currentUser);
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
                populateSavedPosts(currentUser);
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

async function getAllPosts() {
    try {
        const data = await getJSONData();
        const existingData = JSON.parse(data);
        const returnData = [];

        existingData.forEach(postContainer => {
            returnData.push(postContainer);
        });

        console.log(returnData);
        return returnData;
    } catch (error) {
        console.error("Error:", error);
    }
}

//Error handler for google maps (mostly html5 geolocation)
function handleLocationError(error, map) {
    let errorMessage = 'Error: ';

    switch (error.code) {
        case 1:
            errorMessage += 'Permission denied.';
            break;
        case 2:
            errorMessage += 'Location unavailable.';
            break;
        case 3:
            errorMessage += 'Timeout reached.';
            break;
        default:
            errorMessage += 'Unknown error.';
            break;
    }

    let infoWindow = new google.maps.InfoWindow({ map: map });
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent(errorMessage);
}

function addClickableMarkers(flagMap,flagMarker) {
    flagMarker.addListener("gmp-click", () => {
        flagMap.setZoom(11);
        flagMap.setCenter(flagMarker.position);

        markerDetailsModal(flagMarker.data);
        currentPost = flagMarker.data;
    });
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

function fetchAllImages() {
  getJSONData()
	.then(data => {
	  uploadedImages = JSON.parse(data); // Convert JSON string back to an object
	  displayAllImages();
	})
	.catch(error => {
	  console.error("Error fetching images from JSONBin:", error);
	});
}


// EVENT LISTENERS FOR MODALS BELOW:

document.getElementById('newMarkerPics').addEventListener('change', evt => {
    const imageContainer = document.getElementById("new_previewContainer");
    let photos = evt.target.files;

    Array.from(photos).forEach(file => {
        if (!newPostPhotos.some(imgInfo => imgInfo.file.name === file.name)) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.alt = String(file.name);
            img.style.maxWidth = "150px";
            img.title = "Click to Remove Image.";

            let idNum = 0;
            for(let i = 0; i < newPostPhotos.length; i++){
                let imgId = newPostPhotos.find(img => img.id == idNum);
                if (imgId) {
                    idNum++;
                } else {
                    break;
                }
            }
            img.id = idNum;

            const imgInfo = {
                id: img.id,
                src: img.src,
                title: img.alt,
                file: file
            };
            newPostPhotos.push(imgInfo);
            imageContainer.appendChild(img);
        }
    });
});

document.getElementById("new_previewContainer").addEventListener("click", event => {
    if (event.target.tagName === "IMG") { 
        const elmID = newPostPhotos.findIndex(img => img.id == event.target.id);
        newPostPhotos.splice(elmID,1);
        event.target.remove();
        // can add more functionality here
    }
});

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

function updateData(postId, postData, postGlobalId, comments, rating) {
    let existingData = getExistingData(); // Assume you're fetching the current data (posts)
    let foundPost = existingData.find(post => post.id === postId);

    if (foundPost) {
        // Update post comments (existing behavior)
        foundPost.comments = postData.comments;
        
        // ✅ New: Update the post's rating
        foundPost.rating = rating; // This will update the rating

        // Optionally, you can update latitude and longitude if you want
        foundPost.latitude = postData.latitude;
        foundPost.longitude = postData.longitude;
    }

    saveUpdatedData(existingData); // Save the updated data back to the source
}


document.getElementById('newMarkerForm').addEventListener('submit', function(event) {event.preventDefault()});
document.getElementById('updateMarkerForm').addEventListener('submit', function(event) {event.preventDefault()});


document.getElementById("postNewMarker").addEventListener("click", submitData);
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


// WEBPAGE CODE & FUNCS BELOW:

var commentReply;
var commentReplyTarget;
var commentPostedData;

const currentUser = sessionStorage.getItem("currUserNm");
const imgbbApiKey = "0174bc761b940e06f83428e9de24aa0c";
const imgbbUploadEndpoint = "https://api.imgbb.com/1/upload";

var uploadedImages = [];
var currentLatLng;
var currentMap;
var currentPost;
var currentPostPosition;
var newPost_Marker = true;
var markerArray = [];
//for recentering map on original marker after loading all other markers
var recenterMainMarker;
let lastSelectedPlace;


async function initMap() {
    const { Map } = await google.maps.importLibrary("maps"); /* "importLibrary("maps")": Specifically loading the Maps library from the Google Maps JavaScript API */
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker", ); /* "importLibrary("marker")": Specifically loading the Marker library from the Google Maps JavaScript API ; To use call: " google.maps.marker.AdvancedMarkerElement " */
    await google.maps.importLibrary("places");

    const myLatLng = { lat: 39.7065471738, lng: -75.1177295291 };
    
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: myLatLng,
        mapId: "DEMO_MAP_ID",

    });

    // const glyphImg = document.createElement("img");
    // glyphImg.src = "https://i.ibb.co/rGzV41s9/Hyman-lab7-Q5-Answer.png";
    // glyphImg.style.maxWidth = "75px";
    // glyphImg.style.height = "auto";
    const currPosPin = new google.maps.marker.PinElement({
        background: "DarkSlateBlue", // Optional: Set background image
        // glyph: "You Are Here", // Optional: Set glyph text
        // glyph: glyphImg,
        borderColor: "Indigo", // Optional: Set border color
        glyphColor: "White",  // Optional: Set background color
        scale: 1.3
    })
    
    let marker = new google.maps.marker.AdvancedMarkerElement({
        position: myLatLng,
        map,
        title: "Click to zoom",
        content: currPosPin.element
    });

    currentMap = map;
    recenterMainMarker = marker;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map.setCenter(pos);
                recenterMainMarker.position = pos;
            },
            function(error) {
                handleLocationError(error, map);
            }
        );
    } else {
        //Only gets to this if browser doesn't support Geolocation
        handleLocationError({ code: 2 }, map);
    }

    map.addListener("click", (e) => {
        if(newPost_Marker == true) {
            marker = placeMarkerAndPanTo(e.latLng, map);
            newPost_Marker = false;
        } else {
            marker.position = e.latLng;
        }
        currentLatLng = e.latLng;
        currentMap = map;

        newMarkerEntryModal();
    });

    
    marker.addListener("gmp-click", () => {
        map.setZoom(12);
        map.setCenter(marker.position);
    });
}

function placeMarkerAndPanTo(latLng, map, storedData, status) {
    let glyphImage = document.createElement("img");
    let markerBorderColor = "Black";
    let markerBackground = "Gray";
    let markerBorderSize = "2px";
    if(status) {
        if(status == 1){
            markerBorderColor = "DarkGreen";
            markerBackground = "Green";
        } else {
            markerBorderColor = "GoldenRod";
            markerBackground = "Gold";
        }
        markerBorderSize = "4px";
    }

    if(storedData) {
        glyphImage.src = storedData.media[0].imageURL;
        glyphImage.style.maxWidth = "75px";
        glyphImage.style.height = "auto";
        glyphImage.style.border = `${markerBorderSize} solid ${markerBorderColor}`;
        glyphImage.style.borderRadius = "3px";
        glyphImage.style.backgroundColor = markerBackground;
    }

    const pin = new google.maps.marker.PinElement({
        background: markerBackground, // Optional: Set background image
        // glyph: "your-glyph-character", // Optional: Set glyph text
        glyph: glyphImage,
        borderColor: markerBorderColor, // Optional: Set border color
        glyphColor: markerBorderColor,  // Optional: Set background color
        scale: 1.5
    })

    const newMarker = new google.maps.marker.AdvancedMarkerElement({
        position: latLng,
        map: map,
        title: "Click To View Post",
        content: pin.element
    });

    if(storedData) {
        newMarker.data = storedData;

        markerArray.push(newMarker);

        addClickableMarkers(map,newMarker);
    }

    map.panTo(latLng);
    return newMarker;
}

async function showUserPosts() {
    let posts = await getPostsData(currentUser);
    posts.forEach(function(post) {
        let postStatus;
        let pos = {
            lat: post.latitude,
            lng: post.longitude
        };

        placeMarkerAndPanTo(pos, currentMap, post);
    });
    currentMap.setCenter(recenterMainMarker.position);
}

async function showPosts(inputUser) {
    if(inputUser) {
    } else {
        alert("Warning: No SessionID Found, Defaulting To Use testaccount Data!");
        inputUser = "testaccount";
    }

    const data = await getJSONData();
    const existingData = JSON.parse(data);

    const activeUser = existingData.find(user => user.userName === inputUser);

    let allPosts = [];
    existingData.forEach(function(data) {
        allPosts = allPosts.concat(data.posts.createdPosts);
    });

    existingData.forEach(function(user) {
        let userPosts = [];
        userPosts = userPosts.concat(user.posts.createdPosts);

        userPosts.forEach(post => {
            let postStatus;

            if(user.userName == inputUser) {
                if((user.posts.createdPosts.find(ownedPost => post.globalId === ownedPost.globalId)) && !(user.posts.savedPosts.find(savedPost => post.globalId === savedPost.globalId))){
                    postStatus = 1;
                } else {
                    postStatus = 2;

                    let savedPost = post;
                    post = allPosts.find(testPost => testPost.globalId === savedPost.globalId);
                }

                let pos = {
                    lat: post.latitude,
                    lng: post.longitude
                };
                placeMarkerAndPanTo(pos, currentMap, post, postStatus);
            } else if(activeUser.posts.savedPosts.find(savedPost => post.globalId === savedPost.globalId)) {
                let pos = {
                    lat: post.latitude,
                    lng: post.longitude
                };
                placeMarkerAndPanTo(pos, currentMap, post, 2);
            } else {
                let pos = {
                    lat: post.latitude,
                    lng: post.longitude
                };
                placeMarkerAndPanTo(pos, currentMap, post);
            }
        });
    });
    currentMap.setCenter(recenterMainMarker.position);
}

function createSavedPostObject(postData) {
    const dashArea = document.getElementById('savedPostContainer');
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

async function populateSavedPosts(inputUser) {
    try {
        document.getElementById('savedPostContainer').replaceChildren();

        if(inputUser) {
        } else {
            // alert("Warning: No SessionID Found, Defaulting To Use testaccount Data!");
            inputUser = "testaccount";
        }

        const data = await getJSONData();
        const existingData = JSON.parse(data);

        const user = existingData.find(user => user.userName === inputUser);
        const allPosts = [];
        for(let i = 0; i < existingData.length; i++){
            let posts = existingData[i].posts.createdPosts;
            posts.forEach(function(post) {
                allPosts.push(post);
            });
        }

        if (user){
            const userPosts = user.posts.savedPosts;

            if (!Array.isArray(userPosts)) {
                throw new Error("Fetched user posts is not an array!");
            } else {
                if(userPosts.length > 0) {
                    userPosts.forEach((postObject) => {
                        const foundPost = allPosts.find(post => post.globalId === postObject.globalId)
                        createSavedPostObject(foundPost);
                    });
                } else {
                    throw new Error("User has no posts saved!");
                }
            }
        } else {
            throw new Error("User Cannot Be Found");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function initAutocomplete() {
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = 'searchBox';
    document.getElementById('searchContainer').appendChild(placeAutocomplete);
   
    placeAutocomplete.addEventListener("gmp-select", async ({placePrediction}) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
        if (place.viewport) {
            currentMap.fitBounds(place.viewport);
        }
        else {
            recenterMainMarker.position = place.location;
            currentMap.setCenter(place.location);
            currentMap.setZoom(12);
        }
    });
}

window.onload = function() {
    initMap();
    console.log('Page loaded');
    initAutocomplete();
    showPosts(currentUser);
    populateSavedPosts(currentUser);
};
// showUserPosts();
// getAllPosts();
