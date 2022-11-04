import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
const GIF = ({
  gifLink,
  userAddress,
  gifVotes,
  votedUsers,
  addUpvote,
  walletAddress,
  sendTip,
  index,
}) => {
  const [amount, setAmount] = useState("");
  const [isUserUpvoted, setIsUserUpvoted] = useState(false);
  const [isUpvoteLoading, setIsUpvoteLoading] = useState(false);

  useEffect(() => {
    const userAddressesString = votedUsers.map((user) => {
      return user.toString();
    });

    setIsUserUpvoted(userAddressesString.includes(walletAddress));
  }, [addUpvote]);

  return (
    <div className="gif-item">
      <button
        className="upvote-button"
        onClick={() => addUpvote(index, setIsUpvoteLoading)}
        style={{
          color: isUserUpvoted ? "#FF0000" : "black",
        }}
      >
        {isUpvoteLoading ? (
          <Oval
            height={24}
            width={24}
            color="#000070"
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#000000"
            strokeWidth={5}
            strokeWidthSecondary={2}
          />
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={`${isUserUpvoted ? "#FF0000" : "none"}`}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {parseInt(gifVotes)}
          </>
        )}
      </button>
      <img src={gifLink} alt={gifLink} className="up-arrow" />
      <div className="user-info">
        <p>
          {userAddress.toString().slice(0, 3)}.....
          {userAddress.toString().slice(-4, -1)}
        </p>
        {walletAddress === userAddress.toString() ? null : (
          <form
            onSubmit={(e) => sendTip(e, userAddress, amount)}
            className="tip-container"
          >
            <input
              type="number"
              className="tip-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="any"
              placeholder="0.01"
              required
            />
            <button className="tip-button" type="submit">
              Tip
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GIF;
