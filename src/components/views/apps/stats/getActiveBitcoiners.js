import { gql } from "@apollo/client";

const GET_ACTIVE_BITCOINERS = gql`
  query GetActiveBitcoiners($period: String!) {
    activeBitcoiners(period: $period) {
      date
      count
    }
  }
`;

export default GET_ACTIVE_BITCOINERS;
