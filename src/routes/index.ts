import { Router } from 'express';
import user from './User';
import course from './Course';
import camunda from './Camunda';

const routes = Router();

routes.use('/user', user);
routes.use('/course', course);
routes.use('/camunda', camunda);


export { routes };