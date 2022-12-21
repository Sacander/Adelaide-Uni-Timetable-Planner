// button adds new course
function addCourse() {
    const courseTemplate = document.getElementById("courseTemplate");
    const clone = courseTemplate.content.cloneNode(true);
    document.getElementById("courses").appendChild(clone);
}

// parses course times
function submitCourseTimes(button) {
    console.log(button.previousElementSibling.value)
}