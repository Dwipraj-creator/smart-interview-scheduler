const Slot = require("../models/slot.model");

const dayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const convertTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const setDateTime = (date, minutesFromMidnight) => {
  const newDate = new Date(date);

  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;

  newDate.setHours(hours, minutes, 0, 0);

  return newDate;
};

const generateSlotsForAvailability = async (availability) => {
  const today = new Date();
  const endDate = new Date();

  endDate.setDate(today.getDate() + 30);

  const startMinutes = convertTimeToMinutes(availability.startTime);
  const endMinutes = convertTimeToMinutes(availability.endTime);

  let createdCount = 0;

  for (
    let date = new Date(today);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayName = Object.keys(dayMap).find(
      (day) => dayMap[day] === date.getDay()
    );

    if (!availability.daysOfWeek.includes(dayName)) {
      continue;
    }

    for (
      let current = startMinutes;
      current + availability.duration <= endMinutes;
      current += availability.duration
    ) {
      const slotStart = setDateTime(date, current);
      const slotEnd = setDateTime(date, current + availability.duration);

      try {
        await Slot.create({
          interviewerId: availability.interviewerId,
          availabilityId: availability._id,
          startTime: slotStart,
          endTime: slotEnd,
          status: "available",
        });

        createdCount++;
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    }
  }

  return createdCount;
};

module.exports = {
  generateSlotsForAvailability,
};