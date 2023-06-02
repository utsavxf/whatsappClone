
import { Box,styled } from '@mui/material'
import React, { useState,useContext, useEffect,useRef } from 'react'
import Footer from './Footer';
import {AccountContext} from '../../../context/AccountProvider'
import { getMessages, newMessage } from '../../../service/api';
import Message from './Message';
import { Socket } from 'socket.io-client';


//CSS
const Wrapper = styled(Box)`
    background-image: url(${'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'});
    background-size: 50%;
`;

const StyledFooter = styled(Box)`
    height: 55px;
    background: #ededed;
    // position: absolute;
    width: 100%;
    // bottom: 0
`;
    
const Component = styled(Box)`
    height: 80vh;
    overflow-y: scroll;
`;

const Container = styled(Box)`
    padding: 1px 80px;
`;



const Messages = ({person,conversation}) => {


    const [value,setValue]=useState('')
    const [messages,setMessages]=useState([]);

    const [file,setFile]=useState();
    const [image,setImage]=useState('');
    const [incomingMessage,setIncomingMessage]=useState(null);
     

    const scrollRef=useRef();

    const {account,socket,newMessageFlag,setNewMessageFlag}=useContext(AccountContext)


    useEffect(() => {
        socket.current.on('getMessage', data => {
            setIncomingMessage({
                ...data,
                createdAt: Date.now()
            })
        })
    }, []);





   useEffect(()=>{
     const getMessageDetails=async()=>{
         let data=await getMessages(conversation._id);  //using params
        //  console.log(data);
         setMessages(data);
        //  console.log(messages);
         

         
     }

    conversation._id && getMessageDetails();    //undefined waali call nahi aayegi

   },[person._id,conversation._id,newMessageFlag])




  //scrollbar niche se shuru ho isiliye scrollbar
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ transition: "smooth" })
}, [messages]);


  //incoming message ko set karne ke liye

  useEffect(() => {
    incomingMessage && conversation?.members?.includes(incomingMessage.senderId) && 
        setMessages((prev) => [...prev, incomingMessage]);
    
}, [incomingMessage, conversation]);




  const sendText=async(e)=>{
       const code=e.keyCode  || e.which   //'which' is a special  type of keycode,it is diff for every key,it is 13 for enter key
    //    console.log(e);
    // console.log(conversation);
    

       if(code===13){

        let message=[];
         if(!file){

            message={
                senderId:account.sub,
                receiverId:person.sub,
                conversationId:conversation._id,        //ye hum mongodb se get karenge
                type:'text',
                text:value
              }
         }else{
             message={
                senderId:account.sub,
                receiverId:person.sub,
                conversationId:conversation._id,        //ye hum mongodb se get karenge
                type:'file',
                text:image
              }
         }

         socket.current.emit('sendMessage',message);

         await newMessage(message); //save karane ke liye,kuch nahi bas api me bhej rahe hai
         setValue("");
         setFile("");
         setImage("");
 
         setNewMessageFlag(prev =>!prev) 

        //   console.log(message);
          
       }
       
  }


  return (
    <Wrapper>
            <Component>
                {
                    messages && messages.map(message => (
                        <Container ref={scrollRef}>
                            <Message message={message} />
                        </Container>
                    ))
                }
            </Component>
            <Footer
             sendText={sendText}
             setValue={setValue}
             value={value}
             file={file}
             setFile={setFile}
             setImage={setImage}
            />
        </Wrapper>
  )
}

export default Messages
