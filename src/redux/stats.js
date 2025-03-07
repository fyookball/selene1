import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { gql } from "@apollo/client";
import LogService from "@/services/LogService";
import { selectDeviceInfo } from "@/redux/device";
import {
  setPreference,
  selectLastCheckIn,
  selectPrivacySettings,
  selectIsOfflineMode,
} from "@/redux/preferences";
import apolloClient from "@/apolloClient";

const Log = LogService("redux/stats");

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($hashedDeviceId: String!, $date: String!) {
    sendCheckIn(hashedDeviceId: $hashedDeviceId, date: $date) {
      status
    }
  }
`;

// triggerCheckIn: run a daily check in, if current time UTC is on a date later than previous check in
// TODO: check-in interval should be enforced server-side per device ID
export const triggerCheckIn = createAsyncThunk(
  "stats/submitCheckIn",
  async (payload, thunkApi) => {
    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.debug("stats/submitCheckIn blocked by offline mode");
      return;
    }

    const { isDailyCheckInEnabled } = selectPrivacySettings(
      thunkApi.getState()
    );

    if (!isDailyCheckInEnabled) {
      return;
    }

    const now = DateTime.utc();
    const nowFormatted = now.toFormat("yyyyLLdd"); // LL is month, 2 digit padded

    const DAY = "day";

    const lastCheckIn = selectLastCheckIn(thunkApi.getState());

    const defaultLastCheckInMoment = now
      .minus({ days: 1 })
      .startOf(DAY)
      .plus({ seconds: 1 });
    const lastCheckInMoment =
      lastCheckIn === ""
        ? defaultLastCheckInMoment
        : DateTime.fromISO(lastCheckIn).startOf(DAY).plus({ seconds: 1 });

    const nextCheckIn = lastCheckInMoment.plus({ days: 1 }).startOf(DAY);

    const isShouldCheckIn = lastCheckIn === "" || now > nextCheckIn;

    const { deviceIdHash } = selectDeviceInfo(thunkApi.getState());

    Log.debug({ lastCheckIn, isShouldCheckIn, deviceIdHash });

    if (isShouldCheckIn) {
      Log.debug("sending checkin");
      const result = await apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          hashedDeviceId: deviceIdHash,
          date: nowFormatted,
        },
      });

      if (result) {
        Log.debug("check-in successful");
        thunkApi.dispatch(
          setPreference({ key: "lastCheckIn", value: nowFormatted })
        );
      }
    }
  }
);
