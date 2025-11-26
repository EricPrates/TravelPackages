import { useEffect } from "react"

const CallbackScreen = () => {
   useEffect(() => {
       const urlParams = new URLSearchParams(window.location.search);
       const code = urlParams.get('code');
       const error = urlParams.get('error');
         if (code) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', code }, window.location.origin);
            window.close();
         }
         if (error) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin);
            window.close();
         }
   }, []);

   return null;
};

export default CallbackScreen;