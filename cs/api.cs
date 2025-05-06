private IEnumerator SendChatRequest(string message)
{
    yield return new WaitForSeconds(1f);
    chatResponseText.text = "Simulated reply for: " + message;
    avatarEmotionController.UpdateAvatarExpression(new float[] { 0.8f, 0.2f, 0.1f, 0f, 0f, 0f, 0.1f, 0.9f });
}