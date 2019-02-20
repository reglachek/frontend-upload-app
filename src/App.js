import React, { Component } from 'react';
import { uniqueId } from 'lodash'
import fileSize from 'filesize'

import GlobalStyle from './styles/global'
import { Container, Content } from './styles'

import Upload from './components/Upload'
import FileList from './components/FileList'

import api from './services/api'

class App extends Component {
  state = {
    // Guarda os arquivos que foram enviados para upload
    uploadedFiles: []
  }

  async componentDidMount () {
    const response = await api.get('/posts')

    this.setState({
      uploadedFiles: response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: fileSize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))
    })
  }

  // Controla o upload dos arquivos
  handleUpload = files => {
    const uploadedFiles = files.map(file => ({
      file,
      // Gera um ID único com o lodash
      id: uniqueId(),
      // Guarda o nome do arquivo
      name: file.name,
      // Guarda o tamanho da imagem com o MB, KB, GB formatado
      readableSize: fileSize(file.size),
      // Cria uma url para mostrar o preview do arquivo
      preview: URL.createObjectURL(file),
      // Inicializa o valor da barra de progresso de upload
      progress: 0,
      // Inicializa como false a variavel que controla se ja foi feito o upload ou nao
      uploaded: false,
      // Inicializa como false a variavel que controla se houve erro ou nao
      error: false,
      // Inicializa como null a variável que vai guardar a URL da imagem depois que tiver feito o upload
      url: null
    }))

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    })

    uploadedFiles.forEach(this.processUpload)
  }

  updateFile = (id, data) => {
    this.setState({ uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
      return id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile
    })})
  }

  // Controla o processamento de upload do arquivo
  processUpload = (uploadedFile) => {
    // Cria uma instância do objeto de form
    const data = new FormData();

    // Adiciona o campo de name file passando o arquivo de upload
    data.append('file', uploadedFile.file, uploadedFile.name)

    // Envia a requisição para guardar a imagem no servidor
    api.post('/posts', data, {
      // Controla o progresso de upload
      onUploadProgress: e => {
        const progress = parseInt(Math.round((e.loaded * 100) / e.total))

        // Atualiza a barra de progresso 
        this.updateFile(uploadedFile.id, {
          progress
        })
      }
    }).then(response => { //Caso tenha terminado o upload sem errors de API
      // reponse.data do then do axios retorna o que foi retornado no corpo da requisição para API, no caso os dados da imagem
      const { _id: id, url } = response.data

      this.updateFile(uploadedFile.id, {
        uploaded: true,
        id,
        url
      })
    }).catch(() => { // Caso tenha algum erro no upload
      this.updateFile(uploadedFile.id, {
        error: true
      })
    })
  }

  // Deleta a imagem tanto no back quanto no front
  handleDelete = async id => {
    await api.delete(`posts/${id}`)

    this.setState({ uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id) })
  }

  componentWillUnmount() {
    // Remove o cashe gerado pelo navegador
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
  }

  render() {
    const { uploadedFiles } = this.state

    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload}/>
          {!!uploadedFiles && (<FileList files={uploadedFiles} onDelete={this.handleDelete} />)}
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
