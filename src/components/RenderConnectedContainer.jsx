import { useState } from "react";
import GIF from "./GIF";
import { ThreeDots } from "react-loader-spinner";

const RenderConnectedContainer = ({
  gifList,
  createGifAccount,
  sendGif,
  addUpvote,
  walletAddress,
  sendTip,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState("");
  // If we hit this, it means the program account hasn't been initialized.
  if (gifList === null) {
    return (
      <div className="connected-container">
        <button
          className="cta-button submit-gif-button"
          onClick={createGifAccount}
        >
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    );
  } else {
    return (
      // Otherwise, we're good! Account exists. User can submit GIFs.
      <div className="connected-container">
        <form onSubmit={(e) => sendGif(e, inputValue, setInputValue)}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter gif link!"
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        {isLoading ? (
          <div className="loading-container">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#ffffff"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClassName=""
              visible={true}
            />
          </div>
        ) : (
          <div className="gif-grid">
            {gifList.map(
              ({ gifLink, userAddress, gifVotes, votedUsers }, index) => (
                <GIF
                  key={index}
                  gifLink={gifLink}
                  userAddress={userAddress}
                  gifVotes={gifVotes}
                  votedUsers={votedUsers}
                  addUpvote={addUpvote}
                  walletAddress={walletAddress}
                  sendTip={sendTip}
                  index={index}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }
};

export default RenderConnectedContainer;
