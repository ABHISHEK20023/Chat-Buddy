class PeerService{
    constructor(){
        if (!PeerService.instance){
            this.peer=new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    
                    
                    // { urls: "turn:relay1.expressturn.com:3478", username: "user", credential: "password" }
                ] 
            });

            this.peer.oniceconnectionstatechange = () => {
                console.log("ICE Connection State:", this.peer.iceConnectionState);
            };

            this.peer.onicegatheringstatechange = () => {
                console.log("ICE Gathering State:", this.peer.iceGatheringState);
            };

            this.peer.onsignalingstatechange = () => {
                console.log("Signaling State:", this.peer.signalingState);
            };

            PeerService.instance = this;
        }
        return PeerService.instance;
    }

    async getAnswer(offer) {
        try {
            if (!this.peer) {
                throw new Error("Peer connection not initialized");
            }

            // await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            console.log("getAnswer called : ",)
            return answer;
        } catch (error) {
            console.error("Error in getAnswer:", error);
            throw error;
        }
    }

    async medidStream(){
        try {
            const constraints = {
                audio: true,
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

           
                console.log("Adding local stream tracks...");
                stream.getTracks().forEach(track => {
                    this.peer.addTrack(track, stream);
                });

            // console.log("local stream : ", stream);
            return stream;

            // Add tracks to peer connection if it exists

        } catch (error) {
            console.error("Error getting user media:", error);
           
        }
    }

    async getOffer() {
        try {
            if (!this.peer) {
                throw new Error("Peer connection not initialized");
            }

            const offer = await this.peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            })
            await this.peer.setLocalDescription(offer);
            return offer;
        } catch (error) {
            console.error("Error in getOffer:", error);
            throw error;
        }
    }

    async setRemoteDescription(ans){
        try {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            console.log("Remote description set");
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    }
    async addIceCandidate(candidate) {
        // console.log("peer.js candidate :", candidate)
        try {
            if (!this.peer) {
                throw new Error("Peer connection not initialized");
            }

            await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error("Error adding ICE candidate 1 :", error);
        }
    }
}

const peerServiceInstance = new PeerService();
export default peerServiceInstance;