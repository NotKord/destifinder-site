async function submitData(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Clear previous error message
    const errorMessage = document.getElementById("error-message");
    errorMessage.style.display = 'none';

    try {
        // Fetch existing data
        const data = await getJSONData();
        const existingData = JSON.parse(data);

        var inputUser = document.getElementById("userName").value;
        var inputPassword = document.getElementById("password").value;
        
        const user = existingData.find(user => user.email === inputUser || user.userName === inputUser && user.password === inputPassword);
                
        if (user){
            validUser = true;
            sessionStorage.setItem("currUserNm", inputUser);
            window.location.href = 'homepage.html';
        } else {
            throw new Error("Invalid Username or Password");
        }

        // Display success message if credentials are valid
        if (validUser) {
            sessionStorage.setItem("currUserNm", inputUser);
            window.location.href = "homepage.html";
        }

    } catch (error) {
        // Display error message if something went wrong
        console.error("Error:", error);
        errorMessage.style.borderBlockColor = 'maroon';
        errorMessage.style.backgroundColor = 'rgb(222, 120, 120)';
        errorMessage.style.display = 'block';
        errorMessage.innerText = error.message;
    }
}

document.getElementById("putJsonButton").addEventListener("click", submitData);