// Function to validate password
function validatePassword() {
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("errorBox");

  // Regular expression for password validation
  const passwordRegex = /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  // Check if password matches the regex pattern
  if (!passwordRegex.test(password)) {
    errorBox.style.display = 'block';
    errorBox.innerText = "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character, and must not contain spaces.";
    errorBox.className = 'invalid';
    document.getElementById('putJsonButton').disabled = true;
  } else {
    errorBox.style.display = 'none';
    document.getElementById('putJsonButton').disabled = false;
  }
}

// Function to check if the passwords match and contain no whitespace
function checkPasswordMatch() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confPassword").value;
  const errorBox = document.getElementById("errorBox");

  // Regular expression to check for whitespace
  const whitespaceRegex = /\s/;

  if (password !== confirmPassword) {
    errorBox.style.display = 'block';
    errorBox.innerText = "Passwords do not match!";
    errorBox.className = 'invalid';
    document.getElementById('putJsonButton').disabled = true;
  } else if (whitespaceRegex.test(password) || whitespaceRegex.test(confirmPassword)) {
    errorBox.style.display = 'block';
    errorBox.innerText = "Passwords must not contain spaces.";
    errorBox.className = 'invalid';
    document.getElementById('putJsonButton').disabled = true;
  } else {
    errorBox.style.display = 'none';
    document.getElementById('putJsonButton').disabled = false;
  }
}

async function submitData(event) {
  event.preventDefault(); // Prevent default form submission

  const newUser = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    userName: document.getElementById("userName").value,
    password: document.getElementById("password").value,
    email: document.getElementById("email").value,
    posts: {
      createdPosts: [],
      savedPosts: []
    },
    new: true
  };

  try {
    // Fetch existing data
    const data = await getJSONData();
    const existingData = JSON.parse(data);
    
    if (!Array.isArray(existingData)) {
      throw new Error("Fetched data is not an array");
    } else {
      // Check if email or username already exists
      for (let i = 0; i < existingData.length; i++) {
        if (existingData[i].email === newUser.email) {
          alert("This Email Is Already In Use.");
          throw new Error("User entered existing email.");
        }
        if (existingData[i].userName === newUser.userName) {
          alert("This Username Is Not Available.");
          throw new Error("User entered existing username.");
        }
      }
    }

    // Add new user to existing data
    existingData.push(newUser);

    // Update JSONBin with new data
    await putJSONData(existingData);

    // Reset form and show success message
    document.getElementById("addUserForm").reset();
    document.getElementById("response").innerText = "User added successfully!";
    window.location.href = 'login.html'; // Redirect to login
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("response").innerText = "Error: " + error.message;
  }
}

// Event listeners
document.getElementById("putJsonButton").addEventListener("click", submitData);
document.getElementById("password").addEventListener("input", validatePassword);
document.getElementById("confPassword").addEventListener("input", checkPasswordMatch);
