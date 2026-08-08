import LoginForm from "../components/Form.jsx";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeLoginPayload } from "../utils/requestNormalization";

function getLoginErrorMessage(error) {
  return getUserFriendlyErrorMessage(
    error,
    "Unable to login. Please try again.",
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/";
  const infoMessage = location.state?.message || "";

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = normalizeLoginPayload(values);
      await login(payload);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <h1>Login</h1>
      <p className="login-page__intro">
        Welcome back to Jonah's Job Board. Sign in to save jobs, manage your
        recruiter postings, and continue where you left off.
      </p>
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        formClassName="login-form"
        groupClassName="login-form__group"
        gridClassName="login-form__grid"
        errorClassName="form-error"
        submitButtonClassName="login-form__submit"
      />
      {infoMessage ? <p className="form-success">{infoMessage}</p> : null}
      <p className="login-form__hint">
        For security, repeated failed attempts may lock the account for up to 24
        hours.
      </p>
    </main>
  );
}

export default Login;
