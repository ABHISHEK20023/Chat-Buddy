import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
function Signup() {

    const [show, setShow] = useState(false)
    const [name, setName] = useState();
    const [email, setemail] = useState();
    const [confirmpassword, setconfirmpassword] = useState();
    const [password, setpassword] = useState();
    const [pic, setpic] = useState();
    const [loading, setloading] = useState(false);
    const toast = useToast()
    const navigate = useNavigate();
     const [lodingText,setloadingTest]=useState("");


    const handleClick = (e) => {
        setShow(!show);
    }

    const postDetails = async (pics) => {
        // console.log(pics)
        setloadingTest("Uploading")
        setloading(true);
        if(pics===undefined) {
            toast({
                title: 'Please Select an Image!',
                status: 'warning',
                duration: 5000,
                isClosable: true,

            })
            setloading(false);

            return;
        }

        if(pics.type==="image/jpeg" || pics.type==='image/png'){
            const data=new FormData();
            data.append("file",pics);
            data.append('upload_preset',"chat app");
            // data.append("cloud_name","drnewpg2u");
            try {
                const res = await fetch("https://api.cloudinary.com/v1_1/drnewpg2u/image/upload", {
                    method: "post",
                    body: data
                })

                const resData = await res.json();
                setpic(resData.url.toString());
                setloading(false);
                

            } catch (error) {
                console.log(error.message)
                setloading(false);

            }
         
            
        }
        else{
            toast({
                title: 'Please Select an Image!',
                status: 'warning',
                duration: 5000,
                isClosable: true,

            })
            setloading(false);

            return;
        }

    }

    const submitHandler=async ()=>{
        setloadingTest("Signing in")
        setloading(true);

        if(!name || ! email || !password || !confirmpassword){
            toast({
                title: 'Please Fill all the fields',
                status: 'warning',
                duration: 5000,
                isClosable: true,

            })
            setloading(false);
            return;
        }

        try {
           const config={
            headers:{
                "Content-type":"application/json"
            }
           }
           const {data}=await axios.post("/api/user",{name,email,password,pic},config);
            toast({
                title: 'Registration Successful',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            localStorage.setItem('userInfo',JSON.stringify(data));
            setloading(false);
            navigate('/chats');
            
           
        } catch (error) {
            toast({
                title: 'Error Occured',
                description:error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
            setloading(false);

        }
    }
    
    return (
        <VStack spacing='5px' >
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder='Enter Your Name'
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
            </FormControl>

            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder='Enter Your Email'
                    onChange={(e) => {
                        setemail(e.target.value)
                    }}
                />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>

                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Enter Your Password'
                        onChange={(e) => {
                            setpassword(e.target.value)
                        }}
                    />

                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm password</FormLabel>
                <InputGroup>

                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Enter Your Password'
                        onChange={(e) => {
                            setconfirmpassword(e.target.value)
                        }}
                    />

                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='pic' isRequired>
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type='file'
                    p='1.5'
                    accept='image/*'
                    placeholder='Enter Your Email'
                    onChange={(e) => {
                        postDetails(e.target.files[0])
                    }}
                />
            </FormControl>


            <Button colorScheme='blue'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
                loadingText={lodingText}>
                Sign up
            </Button>

        </VStack>
    )
}

export default Signup