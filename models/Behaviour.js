import mongoose from "mongoose";

const behaviourField = {
  type: Number,
  min: 1,
  max: 5,
  default: 3,
};

const BehaviourSchema = new mongoose.Schema({
  discipline: behaviourField,
  communication: behaviourField,
  teamwork: behaviourField,
  participation: behaviourField,
  homeworkCompletion: behaviourField,
  punctuality: behaviourField,
});

export default BehaviourSchema;