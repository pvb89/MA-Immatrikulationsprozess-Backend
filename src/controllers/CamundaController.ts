import { Request, Response } from "express";
import CamundaService from "../services/CamundaService";
import CourseService from "../services/CourseService";

const courseService = new CourseService();
const camundaService = new CamundaService();

class CamundaController {
  public static getDocument = async (req: Request, res: Response, next: any) => {
    let buffer: any;
    try {
      // Dokumenten ID auslesen und anschließend vom DMS laden
      const courseEntry: any = await courseService.findOneCourseEntryById(parseInt(req.params.id, 10))
      const document = await camundaService.getDocument(courseEntry.educationCertificateFile)
      buffer = await document.buffer();
    } catch (error) {
      return next(error);
    }
    // Response senden
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
    });
    res.end(Buffer.from(buffer, 'binary'));
  }

  public static startProcess = async (req: Request, res: Response, next: any) => {
    try {
      const processId = await camundaService.startProcess(req.body);
      courseService.updateProcessId(processId.id, req.body.variables.courseEntryId.value);
    } catch (error) {
      return next(error)
    }
    // Response senden
    res.json({
      success: true,
      message: "Start camunda process succesfully",
      data: {}
    });
  }
  public static triggerProcess = async (req: Request, res: Response, next: any) => {
    try {
      const courseEntry = await courseService.findOneCourseEntryById(parseInt(req.body.id, 10))
      const task = await camundaService.getTask(courseEntry.processId);
      await camundaService.completeTask(task[0].id);
    } catch (error) {
      return next(error)
    }
    // Response senden
    res.json({
      success: true,
      message: "Trigger camunda process succesfully",
      data: {}
    });
  }
}

export default CamundaController;
