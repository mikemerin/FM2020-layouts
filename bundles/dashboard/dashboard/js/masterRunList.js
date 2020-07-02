
class MasterRunList {

  loadValues = (fromReplicant = false) => {
    console.log("hit:", hit);
    console.log("fromReplicant:", fromReplicant);
    console.log("NodeCG.masterRunList:", NodeCG.masterRunList);
    if (fromReplicant && NodeCG.masterRunList.replicantValues) {

      console.log("NodeCG.masterRunList.replicantValues:", NodeCG.masterRunList.replicantValues);
    }
  };



}
