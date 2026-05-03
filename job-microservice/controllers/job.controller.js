import { createdResponse, errorResponse } from "../utils/api-response.js";
import * as jobService from "../services/job.service.js";

export const createJob = async (req, res) => {
  try {
    req.userId = req.userId;
    const result = await jobService.createJobService({
      ...req.body,
      userId: req.userId,
    });
    return createdResponse(res, "Job created successfully", result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllJobsOfUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await jobService.getAllJobsOfUserService(
      req.userId ,
      page,
      limit,
    );

    return createdResponse(res, "Jobs retrieved successfully", result);
  } catch (error) {
      console.log(error);
    return errorResponse(res, 500 ,"Error retrieving user jobs");
  }
};

export const getJobById = async (req, res) => {
  try {
    const {id} = req.params;
    const job = await jobService.getJobByIdService(id, req.userId);
    if (!job) return errorResponse(res,400 ,"Job not found");
    return createdResponse(res, "Job retrieved successfully", job);
  } catch (error) {
    console.log(error)
    return errorResponse(res, 500 , "Error while getting job by id");
  }
};

export const updateJob = async (req, res) => {
  try {
    const {id} = req.params;
    const updatedJob = await jobService.updateJobService(
      id,
      req.userId,
      req.body,
    );
    if (!updatedJob)
      return errorResponse(res, 400 ,"Job not found or update failed");
    return createdResponse(res, "Job updated successfully", updatedJob);
  } catch (error) {
    console.log(error);
    return errorResponse(res,500 ,"Error updating job");
  }
};

export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await jobService.deleteJobService(
      req.params.id,
      req.userId,
    );
    if (!deletedJob)
      return errorResponse(res, 400 ,"Job not found or already deleted");
    return createdResponse(res, "Job deleted successfully", deletedJob);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Error deleting job", error.message);
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobsService();
    return createdResponse(res, "System jobs retrieved", jobs);

  } catch (error) {
    console.log(error);
    return errorResponse(res, 400,"Error retrieving all jobs" )
  }
};

export const updateJobStat = async (req, res) => {
  try {
const {id} = req.params;
    const updatedJob = await jobService.updateJobStatService(
      id,
      req.body,
    );
    if (!updatedJob)
      return errorResponse(res, 400 ,"Job not found for stats update");
    return createdResponse(res, "Stats updated successfully", updatedJob);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 400,"Error updating stats");
  }
};

export const getJobLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Safety check: ensure user owns the job before showing logs
    const {id} = req.params;
    const job = await jobService.getJobByIdService(id, req.userId);
    if (!job) return errorResponse(res, 400 ,"Job not found or unauthorized");

    const logs = await jobService.getJobLogsService(req.params.id, page, limit);
    return createdResponse(res, "Logs retrieved", logs);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500,"Error fetching logs");
  }
};
