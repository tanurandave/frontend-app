import { toast } from 'react-toastify'

export const showToast = {
  success: (message) => {
    toast.success(message || 'Operation successful!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  },
  error: (message) => {
    toast.error(message || 'An error occurred!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  },
  info: (message) => {
    toast.info(message || 'Information', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  },
  warning: (message) => {
    toast.warning(message || 'Warning', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  },
}

export default showToast
