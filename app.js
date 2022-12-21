const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun" ,"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// button adds new course
function addCourse() {
    const courseTemplate = document.getElementById("courseTemplate");
    const clone = courseTemplate.content.cloneNode(true);
    document.getElementById("courses").appendChild(clone);
}

class ClassTime {
    constructor(date, day, time, location) {
        this.date = date;
        this.day = day;
        this.time = time;
        this.location = location;
    }
}

class Class {
    constructor(number, section, classTimes) {
        this.number = number;
        this.section = section;
        this.classTimes = classTimes;
    }
}

function formatClassString(string) {
    let classString = string.split("\t");

    let index = 0;
    let daycount;
    for (element of classString) {
        daycount += 1;
        if (daycount == 2) {
            let subindex = 0;
            let lastword;
            for (word of classString[index].split(" ")) {
                if (months.includes(word)) {
                    subindex -= lastword.length+1;
                    classString[index] = [classString[index].slice(0, subindex-1), classString[index].slice(subindex)];
                    break;
                }
                else if (word.length == 5 && !isNaN(word)) {
                    classString[index] = [classString[index].slice(0, subindex-1), classString[index].slice(subindex)];
                    break;
                }
                subindex += word.length+1;
                lastword = word;
            }
        }
        if (days.includes(element)) {
            daycount = 0;
        }
        index += 1;
    }

    classString = classString.flat();
    index = 0
    for (element of classString) {
        if (element == "Section") {
            classString = classString.slice(0, index);
            break;
        }
        index += 1;
    }
    return classString;
}

function getClass(formattedClassString) {
    const classes = [];
    let counter = 0;
    let number;
    let section;
    let classTimes = [];
    let date;
    let day;
    let time;
    let location;
    let push = true;
    for (element of formattedClassString) {
        if (counter == 0) {
            number = element;
        }
        else if (counter == 1) {
            section = element;
        }
        else if (counter == 4) {
            date = element;
        }
        else if (counter == 5) {
            day = element;
        }
        else if (counter == 6) {
            time = element;
        }
        else if (counter == 7) {
            location = element;
            classTimes.push(new ClassTime(date, day, time, location));
        }
        else if (counter == 8 && element.length == 5) {
            counter = 0;
            for (time of classTimes) {
                if (time.location.includes("offshore") && !document.getElementById("offshore").checked) {
                    push = false;
                }
            }
            if (push) {
                classes.push(new Class(number, section, classTimes));
            }
            push = true;
            classTimes = [];
            number = element;
        }
        else if (counter == 8 && element.length != 5) {
            counter = 4;
            date = element;
        }
        counter += 1;
    }
    for (time of classTimes) {
        if (time.location.includes("offshore") && !document.getElementById("offshore").checked) {
            push = false;
        }
    }
    if (push) {
        classes.push(new Class(number, section, classTimes));
    }

    return classes;
}

// parses course times
function submitCourseTimes(button) {

    const inputString = button.previousElementSibling.value;
    let classStrings = inputString.split("Location ");
    classStrings.shift();

    const formattedClassStrings = [];
    for (string of classStrings) {
        formattedClassStrings.push(formatClassString(string));
    }

    const classes = [];
    for (string of formattedClassStrings) {
        classes.push(getClass(string));
    }

    console.log(classes);
}