const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun" ,"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = new Date();
let year = today.getFullYear();

// code to perform upon loading page
function onLoad() {
    document.getElementById("year").setAttribute("value", year);
    const date = new Date(year, 2, 8);
    addDate(date);
}

// adds date to timetable
function addDate(date) {
    if (!date) {
        date = new Date;
    }
    while (date.getDay() != 5) {
        date.setDate(date.getDate() + 1);
    }
    while (date.getDay() != 0) {
        const today = String(date.getDate()) + "/" + String(date.getMonth() + 1);
        const day = days[date.getDay()];
        const dayTitle = document.getElementById(day.toLowerCase() + "Title");
        dayTitle.innerHTML = day + " " + today;
        dayTitle.attributes.date = new Date(date);
        date.setDate(date.getDate() - 1);
    }
}

// updates year when changed
function updateYear(input) {
    year = input.value;
    const date = new Date(year, 2, 8);
    addDate(date);
}

// button adds new restriction
function addRestriction() {
    const courseTemplate = document.getElementById("restrictionTemplate");
    const clone = courseTemplate.content.cloneNode(true);
    document.getElementById("restrictions").append(clone);
}

// button adds new course
function addCourse() {
    const courseTemplate = document.getElementById("courseTemplate");
    const clone = courseTemplate.content.cloneNode(true);
    document.getElementById("courses").prepend(clone);
}

// changes active week
function prevWeek() {
    const titleMonday = document.getElementById("mondayTitle");
    const date = titleMonday.attributes.date;
    date.setDate(date.getDate() - 7);
    addDate(date);
    renderClasses();
}
function nextWeek() {
    const titleMonday = document.getElementById("mondayTitle");
    const date = titleMonday.attributes.date;
    date.setDate(date.getDate() + 7);
    addDate(date);
    renderClasses();
}

// inputs the strings split at location and returns list of sections of data
function formatClassString(string) {
    let classString = string.split("\t");

    let index = 0;
    let daycount;
    for (const element of classString) {
        daycount += 1;
        if (daycount == 2) {
            let subindex = 0;
            let lastword;
            for (const word of classString[index].split(" ")) {
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
    for (const element of classString) {
        if (element == "Section") {
            classString = classString.slice(0, index);
            break;
        }
        index += 1;
    }
    return classString;
}

// object containing class time data
class ClassTime {
    constructor(date, day, time, location) {
        this.date = date;
        this.day = day;
        this.time = time;
        this.location = location;
    }
}

// object containing class data
class Class {
    constructor(name, number, section, classTimes) {
        this.name = name;
        this.number = number;
        this.section = section;
        this.classTimes = classTimes;
    }
}

// inputs formatted string and returns list of class objects
function getClass(formattedClassString, name) {
    const classes = [];
    let counter = 0;
    let number;
    let section;
    let classTimes = [];
    let date = []; // date will contain start date and end date
    let day;
    let time = []; // time will contain start time (24hr), end time (24hr), and string time
    let location;
    let push = true;
    for (const element of formattedClassString) {
        if (counter == 0) {
            number = element;
        } else if (counter == 1) {
            section = element;
        } else if (counter == 4) {
            for (const datePart of element.split(" - ")) {
                const newDatePart = new Date(Date.parse(datePart));
                newDatePart.setFullYear(year);
                date.push(newDatePart);
            }
        } else if (counter == 5) {
            day = element.toLowerCase();
        } else if (counter == 6) {
            for (const timePart of element.split(" - ")) {
                let newTimePart = +timePart.match(/(\d+)/)[0];
                if (timePart == "12am") {
                    newTimePart = 0;
                } else if (timePart == "12pm") {
                    newTimePart = 12;
                } else if (timePart.includes("pm")) {
                    newTimePart += 12;
                }
                time.push(newTimePart);
            }
            time.push(element);
        } else if (counter == 7) {
            location = element;
            classTimes.push(new ClassTime(date, day, time, location));
            date = [];
            time = [];
        } else if (counter == 8 && element.length == 5) {
            counter = 0;
            for (const classTime of classTimes) {
                if (classTime.location.includes("offshore") && !document.getElementById("offshore").checked) {
                    push = false;
                }
            }
            if (push) {
                classes.push(new Class(name, number, section, classTimes));
            }
            push = true;
            classTimes = [];
            number = element;
        } else if (counter == 8 && element.length != 5) {
            counter = 4;
            for (const datePart of element.split(" - ")) {
                const newDatePart = new Date(Date.parse(datePart));
                newDatePart.setFullYear(year);
                date.push(newDatePart);
            }
        }
        counter += 1;
    }
    for (const classTime of classTimes) {
        if (classTime.location.includes("offshore") && !document.getElementById("offshore").checked) {
            push = false;
        }
    }
    if (push) {
        classes.push(new Class(name, number, section, classTimes));
    }

    return classes;
}

// renders classes
function renderClasses() {
    const lessons = document.getElementsByClassName("lesson");
    while (lessons.length > 0) {
        lessons[0].remove();
    }


    for (const lesson of activeClasses) {
        for (const classTime of lesson.classTimes) {
            const date = document.getElementById(classTime.day + "Title").attributes.date;
            if (date < classTime.date[0] || date > classTime.date[1]) {
                continue;
            }
            const lessonTemplate = document.getElementById("classTemplate");
            const lessonClone = lessonTemplate.content.firstElementChild.cloneNode(true);

            lessonClone.children[0].innerHTML = lesson.name;
            lessonClone.children[1].innerHTML = lesson.section;
            lessonClone.children[2].innerHTML = classTime.time[2];

            lessonClone.style.height = (50*(classTime.time[1] - classTime.time[0])-8) + "px";
            const topOffset = 50 * (classTime.time[0] - 8);
            lessonClone.style.top = String(topOffset + 4) + "px";

            document.getElementById(classTime.day).appendChild(lessonClone);
        }
    }
}

// checks if there is a clash between two classes
function checkBinaryClash(classTime1, classTime2) {
    if (classTime1.day != classTime2.day) {
        return false;
    } else if (classTime1.time[1] <= classTime2.time[0] || classTime1.time[0] >= classTime2.time[1]) {
        return false;
    } else if (classTime1.date[1] < classTime2.date[0] || classTime1.date[0] > classTime2.date[1]) {
        return false;
    } else {
        return true;
    }
}

// checks if classes clash
function checkClash(class1, class2) {
    for (const classTime1 of class1.classTimes) {
        for (const classTime2 of class2.classTimes) {
            if (checkBinaryClash(classTime1, classTime2)) {
                // console.log("Clash with " + class1.name + " " + class1.section + " and " + class2.name + " " + class2.section);
                return true;
            }
        }
    }
    return false;
}

// turns restrictions into date objects
function getRestrictions() {
    const restrictions = [];
    for (const restriction of document.getElementsByClassName("restriction")) {
        const day = restriction.children[0].value;
        let start = restriction.children[1].value.split(":");
        start = +start[0] + (+start[1]/60);
        let end =  restriction.children[2].value.split(":");
        end = +end[0] + (+end[1]/60);
        restrictions.push({day: day, start: start, end: end});
    }
    return restrictions;
}

// parses course times
let activeClasses = [];
function submitCourseTimes() {
    activeClasses = [];
    const classes = [];

    for (const course of document.getElementsByClassName("input")) {
        const name = course.children[0].value;
        const inputString = course.children[1].value;

        const classStrings = inputString.split("Location ");
        classStrings.shift();
    
        const formattedClassStrings = [];
        for (const string of classStrings) {
            formattedClassStrings.push(formatClassString(string));
        }

        for (const string of formattedClassStrings) {
            classes.push(getClass(string, name));
        }
    }

    // breaks function is there are no classes
    if (classes.length == 0) {
        return;
    }

    // remove clashes with restrictions
    const restrictions = getRestrictions();
    function removeRestrictions(lesson) {
        for (const classTime of lesson.classTimes) {
            for (const restriction of restrictions) {
                if (restriction.day == classTime.day && (restriction.start <= classTime.time[0] < restriction.end || restriction.start < classTime.time[1] <= restriction.end)) {
                    return false;
                }
            }
        }
        return true;
    }
    for (let i = 0; i < classes.length; i++) {
        classes[i] = classes[i].filter(removeRestrictions);
        if (classes[i].length == 0) {
            alert("You have too many restrictions.")
        }
    }

    let possibleClassCombinations = [];
    
    const indices = [];
    for (const classType of classes) {
        indices.push(classType.length - 1);
    }
    const maxIndex = indices.length - 1;
    let incomplete = true;
    while (incomplete) {
        const classCombination = [];
        for (let i = 0; i < classes.length; i++) {
            let clash = false;
            for (const lesson of classCombination) {
                if (checkClash(lesson, classes[i][indices[i]])) {
                    clash = true;
                    break;
                }
            }
            if (clash) {
                updateIndices(i);
                break;
            } else {
                classCombination.push(classes[i][indices[i]]);
                if (classCombination.length == classes.length) {
                    possibleClassCombinations.push(classCombination);
                    updateIndices(maxIndex);
                }
            }
        }

        function updateIndices(index) {
            indices[index] -= 1;
            if (indices[index] < 0) {
                indices[index] = classes[index].length - 1;
                if (index != 0) {
                    updateIndices(index - 1);
                } else {
                    incomplete = false;
                }
            }
        }
    }
    possibleClassCombinations = shuffleArray(possibleClassCombinations);
    activeClasses = activeClasses.concat(possibleClassCombinations[0]);
    
    renderClasses();
}

// shuffles array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

// to do:
//   add selection for other possible timetables
//   allow savinig/uploading of timetable
//   view all courses need to enroll in
//   select which courses to include

// if need to improve performance:
//   hijack current system and give options 1 by 1
//   create an object which stores every class each other class clashes with

// known errors:
//   if there are no possible class combinations