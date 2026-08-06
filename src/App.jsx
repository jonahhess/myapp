import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { JobsProvider } from "./contexts/JobsContext.jsx";
import { SearchProvider } from "./contexts/SearchContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <JobsProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </JobsProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
