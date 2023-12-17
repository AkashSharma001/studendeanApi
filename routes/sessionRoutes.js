const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachWeekOfInterval,
  isSameMonth,
  isThursday,
  isFriday,
  setHours,
  setMinutes,
  setSeconds,
} = require("date-fns");

const router = express.Router();

router.get("/", async (req, res) => {
  const currentDate = new Date();
  const { next } = req.query;
  const targetDate = next ? addMonths(currentDate, next) : currentDate;
  const startOfMonthDate = startOfMonth(targetDate);
  const endOfMonthDate = endOfMonth(targetDate);
  const listOfThursdayWeek = eachWeekOfInterval(
    { start: startOfMonthDate, end: endOfMonthDate },
    { weekStartsOn: 4 }
  );
  const listOfFridayWeek = eachWeekOfInterval(
    { start: startOfMonthDate, end: endOfMonthDate },
    { weekStartsOn: 5 }
  );

  const monthDates = [...listOfThursdayWeek, ...listOfFridayWeek]
    .filter((date) => isSameMonth(date, targetDate) && date >= currentDate)
    .sort((a, b) => a - b)
    .map((date) => {
      const modifiedDate = setHours(setMinutes(setSeconds(date, 0), 0), 10);
      return format(modifiedDate, "dd-MM-yyyy h a");
    });

  const sessions = await Session.find({
    student: { $exists: true },
  });
  const availableDates = monthDates.filter(
    (date) => !sessions.some((session) => session.startDateAndTime === date)
  );

  res.json({ availableDates });
});

router.post("/book", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, "secret");
    const userSelectedDate = new Date(req.body.date);
    userSelectedDate.setHours(10, 0, 0, 0);
    console.log(payload);
    if (
      (isThursday(userSelectedDate) || isFriday(userSelectedDate)) &&
      payload.userType === "student"
    ) {
      const selectedDean = await User.findOne({ userType: "dean" });

      if (!selectedDean) {
        return res.status(404).json({ message: "Dean is not available" });
      }
      const isBooked = await Session.find({
        startDateAndTime: format(userSelectedDate, "dd-MM-yyyy h a"),
      });

      if (isBooked.length > 0) {
        return res
          .status(400)
          .json({ message: "Dean is already booked on this date" });
      }

      const session = new Session({
        dean: selectedDean._id,
        student: payload.id,
        startDateAndTime: format(userSelectedDate, "dd-MM-yyyy h a"),
      });

      await session.save();
      return res.status(200).send({ session });
    } else {
      return res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/pending", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = jwt.verify(token, "secret");
  const user = await User.findById(payload.id);
  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd-MM-yyyy h a");
  
  if (!user || user.userType !== "dean") {
    return res.status(403).send("Forbidden");
  }

  const sessions = await Session.find();
  const filteredSessions = sessions.filter((session) => {
    return session.startDateAndTime >= formattedDate; 
  });
  res.send(filteredSessions);
});

module.exports = router;
