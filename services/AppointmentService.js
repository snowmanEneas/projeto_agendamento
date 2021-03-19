var appointment = require("../models/Appointment");
var mongoose = require("mongoose");
var AppointmentFactory = require("../factories/AppointmentFactory"); 
var nodeMailer = require("nodemailer");

const Appo = mongoose.model("Appointment",appointment);

class AppointmentService {
    async Create(name, email, cpf, description, date, time){
        var newAppo = new Appo({
           name,
           email,
           cpf,
           description,
           date,
           time,
           finished: false,
           notified: false
        });
        try{
            await newAppo.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }   
    } 
    async GetAll(showFinished){
        
        if(showFinished){
           return await Appo.find();
        }else{
            var appos = await Appo.find({'finished': false});
            var appointments = [];

            appos.forEach(appointment => {
                if(appointment.date != undefined){
                    appointments.push(AppointmentFactory.Build(appointment) )
                }
            });

            return appointments;
        }
    }
    async GetById(id){

        try{
            var event = await Appo.findOne({'_id': id});
            return event;
        }catch(err){
            console.log(err);
        }
    }
    async Finish(id){
        
        try{
            await Appo.findByIdAndUpdate(id,{finished: true});
            return true;
        }catch(err){
            console.log(err);
            return false;
        }    
    }
    async Search(query){

        try{
            var appos = await Appo.find().or([{email: query},{cpf: query}])
            return appos;
        }catch(err){
            console.log(err);
            return [];
        }
    }
    async SendNotification(){

        try{
            var appos = await this.GetAll(false);
            
            var transporter = mailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 25,
                auth: {
                    user: "3edb05efa41bb6",
                    pass: "f4d4d2222c6acd"
                }
            });
            
            appos.forEach(async app => {

                var date = app.start.getTime();
                var hour = 1000 * 60 * 60 * 3;
                var gap = date-Date.now();

                if(gap <= hour){
                    if(!app.notified){

                        await Appo.findByIdAndUpdate(app._id,{notified: true});

                       transporter.sendMail({
                            from: "Cachorro Louco <cachorro@gmail.com.br>",
                            to: app.email,
                            subject: "Sua Consulta vai ser daqui a 3 horas",
                            text: "Se prepare!!!!"
                        }).then( () => {

                        }).catch(err => {

                        })
                       
                    }
                }
            });
        }catch(err){
            console.log(err);
        }
    }

}

module.exports = new AppointmentService();