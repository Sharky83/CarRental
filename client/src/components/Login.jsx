import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const {setShowLogin, axios, setToken, navigate, setUserData} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [registerAsOwner, setRegisterAsOwner] = React.useState(false);

    const onSubmitHandler = async (event)=>{
        try {
            event.preventDefault();
            const requestData = { name, email, password };
            
            // Add role if registering as owner
            if (state === 'register' && registerAsOwner) {
                requestData.role = 'owner';
            }
            
            const response = await axios.post(`/api/user/${state}`, requestData)
            const data = response.data;

            if (data.success) {
                // Extract token and user from the nested data structure
                const { token, user } = data.data;
                console.log('Login successful - Token:', token ? 'exists' : 'missing', 'User:', user ? user.role : 'missing');
                
                setToken(token)
                localStorage.setItem('token', token)
                
                // Ensure user data exists before setting it
                if (user) {
                    setUserData(user)
                } else {
                    console.error('No user data in response:', data);
                    toast.error('Login successful but user data missing');
                    return;
                }
                
                setShowLogin(false)
                
                // Show success message
                toast.success(state === 'register' ? 'Account created successfully!' : 'Login successful!')
                
                // Redirect based on user role
                if (user && user.role === 'owner') {
                    navigate('/owner');
                } else {
                    navigate('/');
                }
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || error.message || 'Login failed')
        }
        
    }

  return (
    <div onClick={()=> setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>

      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
            </div>
            {state === "register" && (
                <div className="w-full flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="registerAsOwner" 
                        checked={registerAsOwner}
                        onChange={(e) => setRegisterAsOwner(e.target.checked)}
                        className="accent-primary" 
                    />
                    <label htmlFor="registerAsOwner" className="text-sm text-gray-700 cursor-pointer">
                        Register as car owner
                    </label>
                </div>
            )}
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => {setState("login"); setRegisterAsOwner(false);}} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            )}
            <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
    </div>
  )
}

export default Login
