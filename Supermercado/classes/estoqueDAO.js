function Estoque(){
    this.num_itens = 0;
    this.categorias = [];
    this.inventario = {"Nda": {}};
    this.quantidades = {};
    this.av_ids = []; // Ids disponiveis que foram deletados
    this.max = 0;
    this.criar_categoria = function(nome){
        // Recebe o nome da categoria a ser criada
        var valido = true;
        for(var i=0; i < this.categorias.length; i++){
            if(this.categorias[i] == nome){valido=false; break;}
        }
        if(valido){
            this.categorias.push(nome);
            this.inventario[nome] = {};
        }
    }
    this.add_item = function(item, sobrepor){
        // Recebe um objeto produto, se ele já existir sobrepoe caso sobrepor seja verdadeiro
        var cat = item.get_categoria();
        var id = item.get_id();
        var nome = item.get_nome();
        if(!this.inventario.hasOwnProperty(cat)){
            this.inventario[cat] = {};
            console.log("Nova categoria criada: "+ cat);
        }
        for(key in this.inventario){
            // Verficar se ele existe em outra categoria
            if(this.inventario[key].hasOwnProperty(id) && key != cat){
                console.log("Item "+ nome+" ja existe na categoria "+key);
                return false;}
        }
        if(this.inventario[cat][id] !== undefined){
            if(sobrepor){
                this.inventario[cat][id] = item;
            }
            else{
                console.log("Item "+ nome+" ja existente e nao sobreposto");
            }
        }
        else{
            this.inventario[cat][id] = item;
        }
        this.quantidades[id] = 0;
        if(id > this.max){this.max = id;}
        return true;
    }
    this.remove_item = function(id, categoria){
        // Remove um item, passe categoria como null caso nao saiba
        if(categoria != null){
            if(this.inventario.hasOwnProperty(categoria)){
                if(this.inventario[categoria].hasOwnProperty(id)){
                    delete this.inventario[categoria][id];
                    delete this.quantidades[id];
                }
            }
        }
        else{
            for(var key in this.inventario){
                if(this.inventario[key].hasOwnProperty(id)){
                    delete this.inventario[key][id];
                    delete this.quantidades[id];
                    break;
                }
            }
        }
        this.av_ids.push(id);
    }
    this.get_item = function(id, categoria, nome){
        // Pode passar somente nome caso necessario, quanto mais especifico mais rapida a busca
        if(id != null){
            if(categoria != null){
                return this.inventario[categoria][id];
            }
            else{
                for(var key in this.inventario){
                    if(this.inventario[key].hasOwnProperty(id)){
                        return this.inventario[key][id];
                    }
                }
            }
        }
        else{
            if(categoria != null){
                for(var key in this.inventario[categoria]){
                    if(this.inventario[categoria][key].nome == nome){
                        return this.inventario[categoria][key];
                    }
                }
            }
            else{
                for(var key in this.inventario){
                    for(var item in this.inventario[key]){
                        if(this.inventario[key][item].nome == nome){
                            return this.inventario[key][item];
                        }
                    }
                }
            }
        }
        return null;
    }
    this.get_qntd = function(id){
        // Retorna a quantidade de tal item via id
        return this.quantidades[id];
    }
    this.alterar_qntd = function(id, novo_valor){
        // Altera quantidade de um item via id
        this.quantidades[id] = novo_valor;
    }
    this.iniciar = function(produtos, catgs, qtd){
        // Inicializa o estoque dados os produtos e categorias(So chame essa funcao uma vez ao iniciar o objeto)
        // Lista de objetos produtos, lista de categorias(strings) e dicionario de quantidades(id: valor)
        for(var i=0; i < catgs.length; i++){
            this.categorias.push(catgs[i]);
            this.inventario[catgs[i]] = {};
        }
        for(var i=0; i < produtos.length; i++){
            this.add_item(produtos[i], false);
            //this.inventario[produtos[i].categoria][produtos[i].id] = produtos[i];
            this.quantidades[produtos[i].id] = qtd[produtos[i].id];
            this.num_itens += qtd[parseInt(produtos[i].id)];
        }
    }
    this.get_new_id = function(pop){
        // Retorna um id disponivel para ser usado por um novo elemento
        if(this.av_ids.length != 0){
            var id = this.av_ids[0];
            if(pop){this.av_ids.pop(0);}
            return id;
        }
        else{
            return this.max+1;
        }
    }
    this.update_cat = function(item, nova){
        delete this.inventario[item.categoria][item.id];
        if(!this.inventario.hasOwnProperty(nova)){
            this.inventario[nova] = {};
            console.log("Nova categoria criada: "+ nova);
        }
        this.inventario[nova][item.id] = item;
    }
}

module.exports = new Estoque();
