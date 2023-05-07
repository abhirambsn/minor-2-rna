import React, { useContext, createContext, useState, useEffect } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // const { contract } = useContract('0xf59A1f8251864e1c5a6bD64020e3569be27e6AA9');
  const { contract } = useContract('0xcF5a374B2dd27227E675AB22EbAc7dC9A234ef54')
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();

  const [isNgo, setIsNgo] = useState(false);

  const checkNgo = async () => {
    try {
      // Done
      if (!address) return;
      if (!contract) return;
      const data = await contract.call('checkNgo', address);
      setIsNgo(data);
    } catch (err) {
      console.error(err);
      return false
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!address || !contract) return;
      await checkNgo();
    })();
  }, [isNgo, address, contract])

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign([
        address, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.imgUrl
      ])

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getTxns = async (pId) => {
    const txnList = await contract.call('getAllTxns', pId);
    const parsedTxns = txnList.map((txn, i) => ({
      from: txn.from,
      to: txn.to,
      timestamp:new Date(parseInt(txn.timestamp.toString())*1000).toLocaleString('en-IN'),
      amount: ethers.utils.formatEther(txn.amount.toString()),
      type: txn.tx_type
    }))

    return parsedTxns;
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      imgUrl: campaign.imgUrl,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', pId, { value: ethers.utils.parseEther(amount)});

    return data;
  }

  const withdraw = async (pId, amount) => {
    const data = await contract.call('withdrawFromCampaign', pId, amount);
    return data;
  }

  const refund = async (pId) => {
    const data = await contract.call('refundFromCampaign', pId);
    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }


  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        checkNgo,
        isNgo,
        setIsNgo,
        getTxns,
        refund,
        withdraw
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);