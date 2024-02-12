import { mongooseConnect } from "../../../lib/mongoose";
import { Course } from "../../../models/Courses";

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    
    if (method === 'POST') {
        const {title} = req.body;
        if (await Course.findOne({title})) {
          res.status(400).json({message: 'Course already exists'});
        } else {
          res.json(await Course.create({
            title,
            description: 'Course'
          }))
        }
     
      }
}

