import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/UserAuthForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/Session";
import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserProfilePage from "./pages/UserProfilePage";
import BlogPage from "./pages/BlogPage";
import SideNav from "./components/SideNav";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import Notification from "./components/Notification";
import ManageBlogsPage from "./pages/ManageBlogsPage";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkThemePreference = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const App = () => {
  const [userAuth, setUserAuth] = useState({});
  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light"
  );
  useEffect(() => {
    let userInSession = lookInSession("user");
    let themeInSession = lookInSession("theme");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ accessToken: null });

    themeInSession
      ? setTheme(() => {
          document.body.setAttribute("data-theme", themeInSession);
          return themeInSession;
        })
      : document.body.setAttribute("data-theme", theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blogId" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogsPage />} />
              <Route path="notification" element={<Notification />} />
            </Route>
            <Route path="setting" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="signin" element={<UserAuthForm type={"signin"} />} />
            <Route path="signup" element={<UserAuthForm type={"signup"} />} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="user/:id" element={<UserProfilePage />} />
            <Route path="blog/:blogId" element={<BlogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
