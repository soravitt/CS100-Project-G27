const config = {
  backendUrl: "http://localhost:8000/", // Default backend URL
};
const port = 8000;

// change key name for output (add 1.1).
const keyDisplayNames = {
  first_name: "First Name",
  last_name: "Last Name",
  student_id: "Student ID",
  email: "Email",
  title: "Title",
  type_of_work_id: "Type of Work",
  academic_year: "Academic Year",
  semester: "Semester",
  start_date: "Start",
  end_date: "End",
  location: "Location",
  description: "Description"
};

// Function to map actual keys to display names
function getDisplayName(key) {
  return keyDisplayNames[key] || key; // Use the display name if available, otherwise use the actual key
}

// Function to validate Firstname and Lastname
function validateName() {
  const fullnameInput = document.getElementById("fullname");
  const names = fullnameInput.value.trim().split(" ");
  const errorElement = document.getElementById("fullnameError");

  if (names.length !== 2) {
    errorElement.textContent = "Please enter both your Firstname and Lastname.";
    return false;
  } else {
    errorElement.textContent = ""; // Clear the error message when valid
  }
  return true;
}

// Function to validate Student ID
function validateStudentID() {
  const studentIDInput = document.getElementById("studentID");
  const studentIDPattern = /^\d{10}$/;
  const errorElement = document.getElementById("studentIDError");
  const firstTwoDigits = parseInt(studentIDInput.value.substring(0, 2), 10); // slice 2 first digit of Stu. ID.

  if (!studentIDPattern.test(studentIDInput.value)) {
    errorElement.textContent = "Please enter a 10-digit Student ID.";
    return false;
  } else if (firstTwoDigits > 66) {
    errorElement.textContent = "This student ID is not exist."; /* **fix 1** add the first 2 digit ID is more than 66. */
    return false;
  } else {
  errorElement.textContent = ""; // Clear the error message when valid
  }

  return true;
}


// Function to validate University Email
function validateEmail() {
  const emailInput = document.getElementById("email");
  const emailPattern = /^.+@dome\.tu\.ac\.th$/;
  const errorElement = document.getElementById("emailError");

  if (!emailPattern.test(emailInput.value)) {
    errorElement.textContent =
      "Please provide a valid university email in the format 'xxx.yyy@dome.tu.ac.th'.";
    return false;
  } else {
    errorElement.textContent = ""; // Clear the error message when valid
  }
  return true;
}

// Function to validate form inputs on user input
function validateFormOnInput() {
  validateName();
  validateStudentID();
  validateEmail();
}

// Function to fetch activity types from the backend
async function fetchActivityTypes() {
  try {
    const response = await fetch(`http://${window.location.hostname}:${port}/getActivityType`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch activity types.");
      return [];
    }
  } catch (error) {
    console.error("An error occurred while fetching activity types:", error);
    return [];
  }
}

// Function to populate activity types in the select element
function populateActivityTypes(activityTypes) {
  const activityTypeSelect = document.getElementById("activityType");

  for (const type of activityTypes) {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.value;
    activityTypeSelect.appendChild(option);
  }
}

// Event listener when the page content has finished loading
document.addEventListener("DOMContentLoaded", async () => {
  const activityTypes = await fetchActivityTypes();
  populateActivityTypes(activityTypes);
});

// Function to submit the form
async function submitForm(event) {
  event.preventDefault();

  // Validate form inputs before submission
  if (!validateName() || !validateStudentID() || !validateEmail()) {
    return;
  }

  const startDateInput = document.getElementById("startDate").value;
  const endDateInput = document.getElementById("endDate").value;
  const startDate = new Date(startDateInput);
  const endDate = new Date(endDateInput);

  if (endDate <= startDate) {
    alert("End datetime should be after the start datetime.");
    return;
  }

  // Process the description input with new lines
  const descriptionInput = document.getElementById("description").value;
  const description = descriptionInput.replace(/\n/g, "<br>"); // Replace new lines with HTML line breaks


  // Create the data object to send to the backend
  const formData = new FormData(event.target);
  const data = {
    first_name: formData.get("fullname").split(" ")[0],
    last_name: formData.get("fullname").split(" ")[1],
    student_id: parseInt(formData.get("studentID")),
    email: formData.get("email"),
    title: formData.get("workTitle"),
    type_of_work_id: parseInt(formData.get("activityType")),
    academic_year: parseInt(formData.get("academicYear")) - 543,
    semester: parseInt(formData.get("semester")),
    start_date: formData.get("startDate"),
    end_date: formData.get("endDate"),
    location: formData.get("location"),
    description,
  };

  console.log(data);

  try {
    // Send data to the backend using POST request
    const response = await fetch(`http://${window.location.hostname}:${port}/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Form data submitted successfully!");

      // Display success message with formatted data
      const formattedData = Object.entries(responseData.data)
        .map(([key, value]) => `"${getDisplayName(key)}": "${value}"`) // change from key name to keyDisplay name (add 1.2)
        .join("\n");

      // Display the formatted data under the form
      const formDataOutput = document.getElementById("formDataOutput");
      formDataOutput.innerHTML = "Submitted Form Data:<br>" + formatDataAsList(responseData.data);

      document.getElementById("myForm").reset();

      function formatDataAsList(data) {
        const formattedList = Object.entries(data)
          .map(([key, value]) => `<strong>${getDisplayName(key)}:</strong> ${value}`)
          .join("<br>");
        return formattedList;
      } /* **fix 2** */

    } else {
      console.error("Failed to submit form data.");

      // Display error message
      alert("Your date is not in this semester or/ and your descriptions is empty. Please try again."); /* **fix 3** change error massage*/
    }
  } catch (error) {
    console.error("An error occurred while submitting form data:", error);
  }
}

// Event listener for form submission
document.getElementById("myForm").addEventListener("submit", submitForm);

// Event listeners for input validation on user input
document.getElementById("fullname").addEventListener("input", validateName);
document.getElementById("studentID").addEventListener("input", validateStudentID);
document.getElementById("email").addEventListener("input", validateEmail);
