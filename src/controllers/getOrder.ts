import { Request, Response } from "express";
import { getDB } from "../config/db";


export const getOrder = async (req : Request , res: Response)=>{
    const orderId = req.params.id
    const db = getDB();
    try{
        const order = await db.get('SELECT * FROM orders WHERE id=?' ,[orderId]);
        if(!order) return res.status(404).send({message: "cannot find the order"})
        return res.status(200).json(order)
    }
    catch(error){
        console.log("some error occured finding order");
        return res.status(500).json({message : "Server error occured "})
    }
}

