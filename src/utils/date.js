function checkHowManyDaysAgo(first, second) {
  if ((second - first) / (1000 * 60) < 1) {
    return `${Math.round((second - first) / 1000)}s`;
  } else if ((second - first) / (1000 * 60 * 60) < 1) {
    return `${Math.round((second - first) / (1000 * 60))}m`;
  } else if ((second - first) / (1000 * 60 * 60 * 24) < 1) {
    return `${Math.round((second - first) / (1000 * 60 * 60))}h`;
  } else if ((second - first) / (1000 * 60 * 60 * 24 * 31) < 1) {
    return `${Math.round((second - first) / (1000 * 60 * 60 * 24))}d`;
  } else if ((second - first) / (1000 * 60 * 60 * 24 * 31 * 12) < 1) {
    return formatDate(first);
  } else if ((second - first) / (1000 * 60 * 60 * 24 * 31 * 12) > 1) {
    return formatDate(first);
  }
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const nth = function (d) {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

function datePresentation(date) {
  let month, day, year, day_nth, hour, min, sec, amOrpm, day_name;
  // Function returns any date data in a human readable format

  try {
    if (date === "Invalid Date") throw "Invalid Date";

    year = date.getFullYear().toString();
    month = monthNames[date.getMonth()];
    day = date.getDate().toString();
    day_nth = date.getDate() + nth(date.getDate());
    day_name = dayNames[date.getDay()];
    amOrpm = date.getHours() >= 12 ? "pm" : "am";
    hour = ((date.getHours() + 24) % 12 || 12).toString();
    min = date.getMinutes().toString().padStart(2, "0");
    sec = date.getSeconds().toString();
  } catch (error) {
    throw new Error(error);
  }

  return { month, day, year, day_nth, hour, min, sec, day_name, amOrpm };
}

module.exports = {
  datePresentation,
  formatDate,
};
