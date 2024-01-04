import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Login() {

  const [show, setShow] = useState(false)
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  const toast = useToast()

  const handleClick = (e) => {
    setShow(!show);
  }

  const submitHandler = async () => {
    setloading(true);
    if (!email || !password) {
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
      // const config = {
      //   headers: {
      //     "Content-type": "application/json"
      //   }
      // }
      const { data } = await axios.post("/api/user/login", {  email, password });
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setloading(false);
      navigate('/chats');


    } catch (error) {
      toast({
        title: 'Error Occured',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      setloading(false);

    }
  }
  return (
    <VStack spacing='5px' >

      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter Your Email'
          value={email}

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
            value={password}
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

      <Button colorScheme='blue'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={submitHandler}>
        Login
      </Button>
      <Button
        variant={'solid'}
        colorScheme='red'
        width={'100%'}
        isLoading={loading}
        onClick={() => {
          setemail("guest@example.com");
          setpassword("123456");
        }}>Get Guest User Credentials</Button>
    </VStack >
  )
}


export default Login