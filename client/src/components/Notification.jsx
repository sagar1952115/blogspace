import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import NotificationCard from "./NotificatonCard";
import { filterPaginationData } from "../common/FilterPaginationData";
import Loader from "./Loader";
import AnimationWrapper from "../common/AnimationWrapper";
import NoDataMessage from "./NoDataMessage";
import LoadMoreDataBtn from "./LoadMoreDataBtn";

const Notification = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  const {
    userAuth,
    userAuth: { accessToken, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);

  let filters = ["all", "like", "comment", "reply"];

  const handleFilter = (e) => {
    const btn = e.target;
    setFilter(btn.innerHTML);
    setNotifications(null);
  };

  const fetchNotification = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
        { page, filter, deletedDocCount },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async ({ data: { docs: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        let formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/all-notification-count",
          queryParams: `?filter=${filter}`,
          user: accessToken,
        });

        setNotifications(formatedData);
        console.log(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotification({ page: 1 });
    }
  }, [accessToken, filter]);
  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>
      <div className="flex gap-6 my-8 ">
        {filters.map((curr, i) => {
          return (
            <button
              onClick={handleFilter}
              key={i}
              className={`py-2 ${filter === curr ? "btn-dark" : "btn-light"} `}
            >
              {curr}
            </button>
          );
        })}
      </div>

      {!notifications ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificatonState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message="Nothing Available" />
          )}
          <LoadMoreDataBtn
            state={notifications}
            fetchData={fetchNotification}
            additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
          />
        </>
      )}
    </div>
  );
};

export default Notification;
