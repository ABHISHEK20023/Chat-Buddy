import React, { useEffect } from 'react'
import { Container, Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import { useNavigate } from 'react-router-dom'
function Homepage() {
  const navigate=useNavigate();

  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem('userInfo'));
    if(user) navigate('/chats');
  },[navigate])
  return (
    <Container maxW='xl' centerContent>
      <Box
        display='flex'
        justifyContent='center'
        bg='white'
        p='3'
        mb='3px'
        w='100%'
        m='4opx 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
        >

        <Text  fontSize='4xl' fontFamily='Work sans' textAlign='center'>Talk Anytime</Text>
        </Box>
      <Box
        display='flex'
        justifyContent='center'
        bg='white'
        p='3'
        w='100%'
        m='4opx 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
      >
        <Tabs variant='soft-rounded'>
          <TabList mb='1em'>
            <Tab width='50%'>Login</Tab>
            <Tab width='50%'>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
             <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
        
    </Container>
  )
}

export default Homepage