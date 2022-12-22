const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun" ,"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const year = 2023

// code to perform upon loading page
function onLoad() {
    const date = new Date(2023, 2, 8);
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
        const dayTitle = document.getElementById("title" + day);
        dayTitle.innerHTML = day + " " + today;
        dayTitle.attributes.date = new Date(date);
        date.setDate(date.getDate() - 1);
    }
}

// button adds new course
function addCourse() {
    const courseTemplate = document.getElementById("courseTemplate");
    const clone = courseTemplate.content.cloneNode(true);
    document.getElementById("courses").appendChild(clone);
}

// changes active week
function prevWeek() {
    const titleMonday = document.getElementById("titleMonday");
    const date = titleMonday.attributes.date;
    date.setDate(date.getDate() - 7);
    addDate(date);
    renderClasses();
}
function nextWeek() {
    const titleMonday = document.getElementById("titleMonday");
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
    constructor(number, section, classTimes) {
        this.number = number;
        this.section = section;
        this.classTimes = classTimes;
    }
}

// inputs formatted string and returns list of class objects
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
        } else if (counter == 1) {
            section = element;
        } else if (counter == 4) {
            date = element;
        } else if (counter == 5) {
            day = element;
        } else if (counter == 6) {
            time = element;
        } else if (counter == 7) {
            location = element;
            classTimes.push(new ClassTime(date, day, time, location));
        } else if (counter == 8 && element.length == 5) {
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
        } else if (counter == 8 && element.length != 5) {
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

// renders classes
function renderClasses() {
    const lessons = document.getElementsByClassName("lesson");
    while (lessons.length > 0) {
        lessons[0].remove();
    }

    for (lesson of activeClasses) {
        for (classTime of lesson.classTimes) {
            const date = document.getElementById("title" + classTime.day).attributes.date;
            const today = new Date;
            const dates = classTime.date.split(" - ");
            const start = new Date(Date.parse(dates[0]));
            start.setFullYear(year);
            const end = new Date(Date.parse(dates[1]));
            end.setFullYear(year);
            if (date < start || date > end) {
                continue;
            }
            const lessonTemplate = document.getElementById("classTemplate");
            const lessonClone = lessonTemplate.content.firstElementChild.cloneNode(true);

            lessonClone.children[0].innerHTML = lesson.section;
            lessonClone.children[1].innerHTML = classTime.time;

            const lessonTime = [];
            for (time of classTime.time.split(" - ")) {
                let newTime = +time.match(/(\d+)/)[0];
                if (time == "12am") {
                    newTime = 0;
                } else if (time == "12pm") {
                    newTime = 12;
                } else if (time.includes("pm")) {
                    newTime += 12;
                }
                lessonTime.push(newTime);
            }
            lessonClone.style.height = +(50*(lessonTime[1] - lessonTime[0])-8) + "px";
            const topOffset = 50 * (lessonTime[0] - 8);
            lessonClone.style.top = +topOffset + "px";

            const day = classTime.day.toLowerCase();
            document.getElementById(day).appendChild(lessonClone);
        }
    }
}

// parses course times
const activeClasses = [];
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

    for (element of classes) {
        activeClasses.push(element[0]);
    }

    renderClasses();
}