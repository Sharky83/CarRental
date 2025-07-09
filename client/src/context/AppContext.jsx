import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])

    // Function to set user data directly (used after login/register)
    const setUserData = (userData) => {
        if (!userData) {
            console.error('setUserData called with undefined userData');
            return;
        }
        setUser(userData)
        setIsOwner(userData.role === 'owner')
    }

    // Function to check if user is logged in
    const fetchUser = async (shouldRedirect = false)=>{
        try {
           const response = await axios.get('/api/user/data')
           const data = response.data;
           
           if (data.success) {
            const user = data.data.user;
            setUser(user)
            setIsOwner(user.role === 'owner')
            
            // Redirect to appropriate dashboard if requested
            if (shouldRedirect && user.role === 'owner') {
                navigate('/owner')
            }
           }else{
            // Don't show error toast for failed authentication on page load
            if (shouldRedirect) {
                toast.error(data.message)
            }
            navigate('/')
           }
        } catch (error) {
            console.error('Error fetching user data:', error)
            // Only show error toast if it's not an authentication error on page load
            if (error.response?.status !== 401 && shouldRedirect) {
                toast.error(error.message)
            }
            // Clear invalid token
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
                setIsOwner(false)
                axios.defaults.headers.common['Authorization'] = ''
            }
        }
    }
    // Function to fetch all cars from the server
    const fetchCars = async () =>{
        try {
            const response = await axios.get('/api/user/cars')
            const data = response.data;
            data.success ? setCars(data.data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to log out the user
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }


    // useEffect to retrieve the token from localStorage
    useEffect(()=>{
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
        }
        fetchCars()
    },[])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser(false) // Don't redirect automatically on token load
        } else {
            // Clear auth header if no token
            axios.defaults.headers.common['Authorization'] = ''
        }
    },[token])

    const value = {
        navigate, currency, axios, user, setUser, setUserData,
        token, setToken, isOwner, setIsOwner, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, 
        pickupDate, setPickupDate, returnDate, setReturnDate
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}