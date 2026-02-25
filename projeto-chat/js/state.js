export const state = {
    user: null
};

export const privateMessageState = {
    ativo: false,
    receiver_id: null,
    receiver_name: null
};

export function setPrivateMessage(receiver_id, receiver_name) {
    privateMessageState.ativo = true;
    privateMessageState.receiver_id = receiver_id;
    privateMessageState.receiver_name = receiver_name;
}

export function clearPrivateMessage() {
    privateMessageState.ativo = false;
    privateMessageState.receiver_id = null;
    privateMessageState.receiver_name = null;
}